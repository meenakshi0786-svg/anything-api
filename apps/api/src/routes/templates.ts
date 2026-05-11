import type { FastifyPluginAsync } from "fastify";
import { db } from "@afa/db";
import { workflows, workflowVersions } from "@afa/db";
import { TEMPLATES, getTemplate, getCategories } from "@afa/templates";
import { authenticate, type AuthContext } from "../middleware/auth.js";
import { nanoid } from "nanoid";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const templateRoutes: FastifyPluginAsync = async (app) => {
  // List all templates
  app.get("/templates", async (request, reply) => {
    return reply.send({
      data: TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        icon: t.icon,
        difficulty: t.difficulty,
        tags: t.tags,
        stepsCount: t.steps.length,
        exampleInput: t.exampleInput,
      })),
      meta: {
        requestId: request.id,
        categories: getCategories(),
        total: TEMPLATES.length,
      },
    });
  });

  // Get template details (full step config)
  app.get("/templates/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const template = getTemplate(id);
    if (!template) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: "Template not found" },
      });
    }
    return reply.send({
      data: template,
      meta: { requestId: request.id },
    });
  });

  // Install a template — creates a new workflow owned by the user
  app.post("/templates/:id/install", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };
      const template = getTemplate(id);

      if (!template) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Template not found" },
        });
      }

      const slug = `${slugify(template.name)}-${nanoid(6)}`;

      const [workflow] = await db
        .insert(workflows)
        .values({
          userId: auth.userId,
          slug,
          name: template.name,
          description: template.description,
          inputSchema: template.inputSchema,
          outputSchema: template.outputSchema,
          settings: { templateId: template.id },
          tags: template.tags,
          category: template.category,
          isActive: true,
        })
        .returning();

      await db.insert(workflowVersions).values({
        workflowId: workflow.id,
        version: 1,
        steps: template.steps,
        inputSchema: template.inputSchema,
        outputSchema: template.outputSchema,
        changelog: `Installed from template: ${template.id}`,
        createdBy: "template",
      });

      return reply.status(201).send({
        data: {
          id: workflow.id,
          slug: workflow.slug,
          name: workflow.name,
          endpoint: `/v1/run/${workflow.slug}`,
          templateId: template.id,
          exampleInput: template.exampleInput,
        },
        meta: { requestId: request.id },
      });
    },
  });
};
