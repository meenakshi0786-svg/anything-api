import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { healthRoutes } from "./routes/health.js";
import { workflowRoutes } from "./routes/workflows.js";
import { runRoutes } from "./routes/runs.js";
import { scheduleRoutes } from "./routes/schedules.js";
import { studioRoutes } from "./routes/studio.js";
import { authRoutes } from "./routes/auth.js";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty" }
        : undefined,
  },
  requestId: true,
});

// ─── Plugins ──────────────────────────────────────────────
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  keyGenerator: (req) => {
    // Use API key if present, otherwise IP
    return (req.headers["x-api-key"] as string) || req.ip;
  },
});

// ─── Global error handler ─────────────────────────────────
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    error: {
      code: error.code || "INTERNAL_ERROR",
      message:
        statusCode === 500
          ? "An internal error occurred"
          : error.message,
    },
    meta: { requestId: request.id },
  });
});

// ─── Routes ───────────────────────────────────────────────
await app.register(healthRoutes, { prefix: "/v1" });
await app.register(workflowRoutes, { prefix: "/v1" });
await app.register(runRoutes, { prefix: "/v1" });
await app.register(scheduleRoutes, { prefix: "/v1" });
await app.register(studioRoutes, { prefix: "/v1" });
await app.register(authRoutes, { prefix: "/v1" });

// ─── Start ────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
  app.log.info(`API server running at http://${host}:${port}`);
} catch (err) {
  app.log.fatal(err);
  process.exit(1);
}
