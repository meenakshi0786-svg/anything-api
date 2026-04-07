import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "@afa/db";
import { schedules, workflows } from "@afa/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, type AuthContext } from "../middleware/auth.js";

const createScheduleSchema = z.object({
  workflowId: z.string().uuid(),
  cron: z.string().min(9).max(100), // "0 */6 * * *"
  timezone: z.string().default("UTC"),
  input: z.record(z.unknown()).default({}),
  webhookUrl: z.string().url().optional(),
});

export const scheduleRoutes: FastifyPluginAsync = async (app) => {
  // Create schedule
  app.post("/schedules", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const body = createScheduleSchema.parse(request.body);

      // Verify workflow exists
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, body.workflowId), eq(workflows.userId, auth.userId)))
        .limit(1);

      if (!workflow) {
        return reply.status(404).send({
          error: { code: "WORKFLOW_NOT_FOUND", message: "Workflow not found" },
        });
      }

      const [schedule] = await db
        .insert(schedules)
        .values({
          workflowId: body.workflowId,
          userId: auth.userId,
          cronExpression: body.cron,
          timezone: body.timezone,
          input: body.input,
          webhookUrl: body.webhookUrl,
        })
        .returning();

      return reply.status(201).send({
        data: {
          id: schedule.id,
          workflowId: schedule.workflowId,
          cron: schedule.cronExpression,
          timezone: schedule.timezone,
          isActive: schedule.isActive,
          nextRunAt: schedule.nextRunAt,
          createdAt: schedule.createdAt,
        },
        meta: { requestId: request.id },
      });
    },
  });

  // List schedules
  app.get("/schedules", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;

      const results = await db
        .select()
        .from(schedules)
        .where(eq(schedules.userId, auth.userId))
        .orderBy(desc(schedules.createdAt));

      return reply.send({
        data: results,
        meta: { requestId: request.id },
      });
    },
  });

  // Delete schedule
  app.delete("/schedules/:id", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };

      await db
        .delete(schedules)
        .where(and(eq(schedules.id, id), eq(schedules.userId, auth.userId)));

      return reply.status(204).send();
    },
  });
};
