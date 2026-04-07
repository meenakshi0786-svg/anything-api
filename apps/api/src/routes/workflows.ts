import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "@afa/db";
import { workflows, workflowVersions } from "@afa/db";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authenticate, type AuthContext } from "../middleware/auth.js";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");
const plannerQueue = new Queue("planner", { connection: redis });

// ─── Validation Schemas ───────────────────────────────────

const createWorkflowSchema = z.object({
  mode: z.enum(["ai", "manual"]),
  prompt: z.string().min(10).max(2000).optional(),
  name: z.string().min(1).max(200).optional(),
  steps: z.array(z.any()).optional(),
  testInput: z.record(z.unknown()).optional(),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  settings: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

// ─── Helpers ──────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ─── Routes ───────────────────────────────────────────────

export const workflowRoutes: FastifyPluginAsync = async (app) => {
  // Create workflow (AI or manual)
  app.post("/workflows", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const body = createWorkflowSchema.parse(request.body);

      if (body.mode === "ai" && !body.prompt) {
        return reply.status(400).send({
          error: { code: "MISSING_PROMPT", message: "AI mode requires a prompt" },
        });
      }

      // Generate slug from prompt or name
      const name = body.name || body.prompt!.slice(0, 100);
      const slug = slugify(name) + "-" + nanoid(6);

      // Create workflow record
      const [workflow] = await db
        .insert(workflows)
        .values({
          userId: auth.userId,
          teamId: auth.teamId,
          slug,
          name,
          description: body.prompt,
          inputSchema: {},
          outputSchema: {},
          settings: {},
        })
        .returning();

      if (body.mode === "ai") {
        // Queue AI planner job
        await plannerQueue.add("plan-workflow", {
          workflowId: workflow.id,
          userId: auth.userId,
          prompt: body.prompt,
          testInput: body.testInput,
        });

        return reply.status(202).send({
          data: {
            id: workflow.id,
            slug: workflow.slug,
            name: workflow.name,
            status: "planning",
            message: "AI is generating your workflow. Poll this endpoint for updates.",
            endpoint: `/v1/run/${workflow.slug}`,
          },
          meta: { requestId: request.id },
        });
      }

      // Manual mode: save steps directly
      if (body.steps) {
        await db.insert(workflowVersions).values({
          workflowId: workflow.id,
          version: 1,
          steps: body.steps,
          inputSchema: {},
          outputSchema: {},
        });
      }

      return reply.status(201).send({
        data: {
          id: workflow.id,
          slug: workflow.slug,
          name: workflow.name,
          version: 1,
          endpoint: `/v1/run/${workflow.slug}`,
          inputSchema: workflow.inputSchema,
          outputSchema: workflow.outputSchema,
          stepsCount: body.steps?.length || 0,
          isActive: true,
          createdAt: workflow.createdAt,
        },
        meta: { requestId: request.id },
      });
    },
  });

  // List workflows
  app.get("/workflows", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const query = request.query as { page?: string; perPage?: string };
      const page = Math.max(1, Number(query.page) || 1);
      const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 20));
      const offset = (page - 1) * perPage;

      const results = await db
        .select()
        .from(workflows)
        .where(eq(workflows.userId, auth.userId))
        .orderBy(desc(workflows.updatedAt))
        .limit(perPage)
        .offset(offset);

      return reply.send({
        data: results.map((w) => ({
          id: w.id,
          slug: w.slug,
          name: w.name,
          description: w.description,
          version: w.currentVersion,
          endpoint: `/v1/run/${w.slug}`,
          isActive: w.isActive,
          usageCount: w.usageCount,
          avgRuntimeMs: w.avgRuntimeMs,
          successRate: w.successRate,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
        meta: {
          requestId: request.id,
          page,
          perPage,
          hasMore: results.length === perPage,
        },
      });
    },
  });

  // Get workflow by ID
  app.get("/workflows/:id", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };

      const [workflow] = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.userId, auth.userId)))
        .limit(1);

      if (!workflow) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Workflow not found" },
        });
      }

      // Get current version with steps
      const [version] = await db
        .select()
        .from(workflowVersions)
        .where(
          and(
            eq(workflowVersions.workflowId, id),
            eq(workflowVersions.version, workflow.currentVersion)
          )
        )
        .limit(1);

      return reply.send({
        data: {
          id: workflow.id,
          slug: workflow.slug,
          name: workflow.name,
          description: workflow.description,
          version: workflow.currentVersion,
          endpoint: `/v1/run/${workflow.slug}`,
          inputSchema: workflow.inputSchema,
          outputSchema: workflow.outputSchema,
          settings: workflow.settings,
          steps: version?.steps || [],
          stepsCount: Array.isArray(version?.steps)
            ? (version.steps as any[]).length
            : 0,
          isActive: workflow.isActive,
          usageCount: workflow.usageCount,
          avgRuntimeMs: workflow.avgRuntimeMs,
          successRate: workflow.successRate,
          tags: workflow.tags,
          category: workflow.category,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
        },
        meta: { requestId: request.id },
      });
    },
  });

  // Update workflow
  app.put("/workflows/:id", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };
      const body = updateWorkflowSchema.parse(request.body);

      const [updated] = await db
        .update(workflows)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(and(eq(workflows.id, id), eq(workflows.userId, auth.userId)))
        .returning();

      if (!updated) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Workflow not found" },
        });
      }

      return reply.send({
        data: { id: updated.id, name: updated.name, updatedAt: updated.updatedAt },
        meta: { requestId: request.id },
      });
    },
  });

  // Delete workflow
  app.delete("/workflows/:id", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };

      const [deleted] = await db
        .delete(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.userId, auth.userId)))
        .returning({ id: workflows.id });

      if (!deleted) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Workflow not found" },
        });
      }

      return reply.status(204).send();
    },
  });

  // Get workflow versions
  app.get("/workflows/:id/versions", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const versions = await db
        .select({
          version: workflowVersions.version,
          changelog: workflowVersions.changelog,
          createdBy: workflowVersions.createdBy,
          createdAt: workflowVersions.createdAt,
        })
        .from(workflowVersions)
        .where(eq(workflowVersions.workflowId, id))
        .orderBy(desc(workflowVersions.version));

      return reply.send({
        data: versions,
        meta: { requestId: request.id },
      });
    },
  });
};
