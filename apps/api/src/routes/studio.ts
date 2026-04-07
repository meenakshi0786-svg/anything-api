import type { FastifyPluginAsync } from "fastify";
import { authenticate, type AuthContext } from "../middleware/auth.js";

/**
 * Studio routes — conversational workflow builder.
 * Uses SSE (Server-Sent Events) for streaming AI responses.
 */
export const studioRoutes: FastifyPluginAsync = async (app) => {
  // Create studio session
  app.post("/studio/sessions", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;

      // TODO: Create session in Redis with TTL
      const sessionId = crypto.randomUUID();

      return reply.status(201).send({
        data: {
          id: sessionId,
          messages: [],
          createdAt: new Date().toISOString(),
        },
        meta: { requestId: request.id },
      });
    },
  });

  // Send message to studio session (SSE stream response)
  app.post("/studio/sessions/:id/message", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };
      const { message } = request.body as { message: string };

      // Set SSE headers
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // TODO: Integrate with AI planner for conversational workflow building
      // For now, send a placeholder response

      const sendEvent = (event: string, data: unknown) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent("thinking", { message: "Analyzing your request..." });

      // Simulate AI response (replace with actual LLM call)
      sendEvent("message", {
        role: "assistant",
        content: `I'll help you build a workflow for: "${message}". Let me design the steps...`,
      });

      sendEvent("done", { sessionId: id });
      reply.raw.end();
    },
  });

  // Deploy workflow from studio session
  app.post("/studio/sessions/:id/deploy", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };

      // TODO: Take the current workflow from the session and create it
      return reply.send({
        data: { message: "Workflow deployed", sessionId: id },
        meta: { requestId: request.id },
      });
    },
  });
};
