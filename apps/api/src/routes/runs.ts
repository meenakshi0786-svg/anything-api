import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "@afa/db";
import { workflows, runs, runSteps, runLogs } from "@afa/db";
import { eq, and, desc, or } from "drizzle-orm";
import { authenticate, type AuthContext } from "../middleware/auth.js";
import { recordUsage } from "../middleware/metering.js";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");
const executionQueue = new Queue("execution", { connection: redis });

const runRequestSchema = z.object({
  input: z.record(z.unknown()).optional().default({}),
  mode: z.enum(["sync", "async", "stream"]).optional().default("sync"),
  webhookUrl: z.string().url().optional(),
});

const batchRunSchema = z.object({
  workflowId: z.string().uuid(),
  inputs: z.array(z.record(z.unknown())).min(1).max(100),
  concurrency: z.number().min(1).max(20).optional().default(5),
  webhookUrl: z.string().url().optional(),
});

export const runRoutes: FastifyPluginAsync = async (app) => {
  // ─── Sync run by slug (simplest usage) ──────────────────
  // POST /v1/run/:slug
  app.post("/run/:slug", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { slug } = request.params as { slug: string };
      const input = (request.body as Record<string, unknown>) || {};

      // Find workflow by slug
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.slug, slug), eq(workflows.userId, auth.userId)))
        .limit(1);

      if (!workflow) {
        return reply.status(404).send({
          error: { code: "WORKFLOW_NOT_FOUND", message: `No workflow with slug: ${slug}` },
        });
      }

      if (!workflow.isActive) {
        return reply.status(400).send({
          error: { code: "WORKFLOW_INACTIVE", message: "This workflow is inactive" },
        });
      }

      // Create run record
      const [run] = await db
        .insert(runs)
        .values({
          workflowId: workflow.id,
          workflowVersion: workflow.currentVersion,
          userId: auth.userId,
          apiKeyId: auth.apiKeyId,
          status: "queued",
          mode: "sync",
          input,
        })
        .returning();

      // Queue execution job
      const job = await executionQueue.add(
        "execute-workflow",
        {
          runId: run.id,
          workflowId: workflow.id,
          version: workflow.currentVersion,
          input,
          userId: auth.userId,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        }
      );

      // For sync mode, wait for result (with timeout)
      const timeoutMs = (workflow.settings as any)?.maxRuntimeMs || 60000;

      try {
        const result = await job.waitUntilFinished(
          executionQueue.events,
          timeoutMs
        );

        // Record usage
        await recordUsage({
          userId: auth.userId,
          teamId: auth.teamId,
          runId: run.id,
          metric: "run_count",
          quantity: 1,
        });

        // Return clean output with metadata
        return reply.send({
          ...result.output,
          _meta: {
            run_id: run.id,
            runtime_ms: result.runtimeMs,
            cached: result.cached || false,
            version: workflow.currentVersion,
          },
        });
      } catch (err: any) {
        return reply.status(500).send({
          error: {
            code: "EXECUTION_FAILED",
            message: err.message || "Workflow execution failed",
            run_id: run.id,
          },
        });
      }
    },
  });

  // ─── Async run ──────────────────────────────────────────
  // POST /v1/runs
  app.post("/runs", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const body = z
        .object({
          workflowId: z.string().uuid().optional(),
          workflowSlug: z.string().optional(),
          input: z.record(z.unknown()).default({}),
          mode: z.enum(["async", "stream"]).default("async"),
          webhookUrl: z.string().url().optional(),
        })
        .parse(request.body);

      // Find workflow
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(
          and(
            body.workflowId
              ? eq(workflows.id, body.workflowId)
              : eq(workflows.slug, body.workflowSlug!),
            eq(workflows.userId, auth.userId)
          )
        )
        .limit(1);

      if (!workflow) {
        return reply.status(404).send({
          error: { code: "WORKFLOW_NOT_FOUND", message: "Workflow not found" },
        });
      }

      // Create run
      const [run] = await db
        .insert(runs)
        .values({
          workflowId: workflow.id,
          workflowVersion: workflow.currentVersion,
          userId: auth.userId,
          apiKeyId: auth.apiKeyId,
          status: "queued",
          mode: body.mode,
          input: body.input,
        })
        .returning();

      // Queue execution
      await executionQueue.add("execute-workflow", {
        runId: run.id,
        workflowId: workflow.id,
        version: workflow.currentVersion,
        input: body.input,
        userId: auth.userId,
        webhookUrl: body.webhookUrl,
      });

      return reply.status(202).send({
        data: {
          runId: run.id,
          status: "queued",
          pollUrl: `/v1/runs/${run.id}`,
          estimatedRuntimeMs: workflow.avgRuntimeMs || 5000,
        },
        meta: { requestId: request.id },
      });
    },
  });

  // ─── Get run status + result ────────────────────────────
  app.get("/runs/:id", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };

      const [run] = await db
        .select()
        .from(runs)
        .where(and(eq(runs.id, id), eq(runs.userId, auth.userId)))
        .limit(1);

      if (!run) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Run not found" },
        });
      }

      return reply.send({
        data: {
          id: run.id,
          workflowId: run.workflowId,
          status: run.status,
          mode: run.mode,
          input: run.input,
          output: run.output,
          error: run.error,
          startedAt: run.startedAt,
          completedAt: run.completedAt,
          runtimeMs: run.runtimeMs,
          stepCount: run.stepCount,
          createdAt: run.createdAt,
        },
        meta: { requestId: request.id },
      });
    },
  });

  // ─── Get run steps detail ───────────────────────────────
  app.get("/runs/:id/steps", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const steps = await db
        .select()
        .from(runSteps)
        .where(eq(runSteps.runId, id))
        .orderBy(runSteps.startedAt);

      return reply.send({
        data: steps,
        meta: { requestId: request.id },
      });
    },
  });

  // ─── Get run logs ───────────────────────────────────────
  app.get("/runs/:id/logs", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { level?: string };

      let q = db.select().from(runLogs).where(eq(runLogs.runId, id));

      const logs = await q.orderBy(runLogs.timestamp);

      return reply.send({
        data: logs,
        meta: { requestId: request.id },
      });
    },
  });

  // ─── Batch run ──────────────────────────────────────────
  app.post("/runs/batch", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const body = batchRunSchema.parse(request.body);

      const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, body.workflowId))
        .limit(1);

      if (!workflow) {
        return reply.status(404).send({
          error: { code: "WORKFLOW_NOT_FOUND", message: "Workflow not found" },
        });
      }

      // Create run records for each input
      const runRecords = await Promise.all(
        body.inputs.map((input) =>
          db
            .insert(runs)
            .values({
              workflowId: workflow.id,
              workflowVersion: workflow.currentVersion,
              userId: auth.userId,
              apiKeyId: auth.apiKeyId,
              status: "queued",
              mode: "batch",
              input,
            })
            .returning()
            .then(([r]) => r)
        )
      );

      // Queue all executions
      await Promise.all(
        runRecords.map((run, i) =>
          executionQueue.add("execute-workflow", {
            runId: run.id,
            workflowId: workflow.id,
            version: workflow.currentVersion,
            input: body.inputs[i],
            userId: auth.userId,
            webhookUrl: body.webhookUrl,
            batchIndex: i,
          })
        )
      );

      return reply.status(202).send({
        data: {
          batchSize: runRecords.length,
          runs: runRecords.map((r) => ({
            runId: r.id,
            status: "queued",
            pollUrl: `/v1/runs/${r.id}`,
          })),
        },
        meta: { requestId: request.id },
      });
    },
  });

  // ─── Cancel run ─────────────────────────────────────────
  app.post("/runs/:id/cancel", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };

      const [updated] = await db
        .update(runs)
        .set({ status: "cancelled", completedAt: new Date() })
        .where(
          and(
            eq(runs.id, id),
            eq(runs.userId, auth.userId),
            or(eq(runs.status, "queued"), eq(runs.status, "running"))
          )
        )
        .returning();

      if (!updated) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Run not found or already completed" },
        });
      }

      return reply.send({
        data: { id: updated.id, status: "cancelled" },
        meta: { requestId: request.id },
      });
    },
  });
};
