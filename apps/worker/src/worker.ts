import { Worker } from "bullmq";
import IORedis from "ioredis";
import { db } from "@afa/db";
import { runs } from "@afa/db";
import { eq } from "drizzle-orm";
import { ExecutionEngine } from "./executor/engine.js";
import { BrowserPool } from "./browser/pool.js";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// ─── Initialize browser pool ─────────────────────────────
const browserPool = new BrowserPool({
  maxConcurrent: Number(process.env.BROWSER_POOL_SIZE) || 5,
  recycleAfterRuns: 50,
});

await browserPool.initialize();

// ─── Execution Worker ─────────────────────────────────────
const executionWorker = new Worker(
  "execution",
  async (job) => {
    const { runId, workflowId, version, input, userId, webhookUrl: requestWebhook } = job.data;

    // Resolve webhook URL: per-request takes priority, then workflow default
    let webhookUrl = requestWebhook;
    if (!webhookUrl) {
      const { workflows } = await import("@afa/db");
      const [wf] = await db
        .select({ settings: workflows.settings })
        .from(workflows)
        .where(eq(workflows.id, workflowId))
        .limit(1);
      const settings = wf?.settings as any;
      if (settings?.defaultWebhookUrl) {
        webhookUrl = settings.defaultWebhookUrl;
      }
    }

    console.log(`[worker] Starting execution: run=${runId} workflow=${workflowId}`);

    // Update run status
    await db
      .update(runs)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(runs.id, runId));

    const engine = new ExecutionEngine({
      browserPool,
      runId,
      workflowId,
      version,
      input,
      userId,
    });

    try {
      const result = await engine.execute();

      // Update run with success
      await db
        .update(runs)
        .set({
          status: "completed",
          output: result.output,
          completedAt: new Date(),
          runtimeMs: result.runtimeMs,
          browserMs: result.browserMs,
          stepCount: result.stepCount,
        })
        .where(eq(runs.id, runId));

      // Deliver webhook if configured
      if (webhookUrl) {
        await deliverWebhook(webhookUrl, {
          event: "run.completed",
          runId,
          workflowId,
          output: result.output,
          runtimeMs: result.runtimeMs,
        });
      }

      console.log(`[worker] Completed: run=${runId} in ${result.runtimeMs}ms`);
      return result;
    } catch (error: any) {
      console.error(`[worker] Failed: run=${runId}`, error.message);

      // Update run with failure
      await db
        .update(runs)
        .set({
          status: "failed",
          error: {
            code: error.code || "EXECUTION_ERROR",
            message: error.message,
            stepId: error.stepId,
          },
          completedAt: new Date(),
        })
        .where(eq(runs.id, runId));

      if (webhookUrl) {
        await deliverWebhook(webhookUrl, {
          event: "run.failed",
          runId,
          workflowId,
          error: { code: error.code, message: error.message },
        });
      }

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
    limiter: {
      max: 10,
      duration: 1000, // max 10 jobs per second
    },
  }
);

// ─── Planner Worker (NL → workflow DAG) ───────────────────
const plannerWorker = new Worker(
  "planner",
  async (job) => {
    const { workflowId, prompt, testInput } = job.data;
    console.log(`[planner] Planning workflow: ${workflowId} prompt="${prompt}"`);

    const { workflowVersions, workflows } = await import("@afa/db");

    try {
      const { Planner } = await import("./ai/planner.js");
      const planner = new Planner();

      const result = await planner.planWorkflow(prompt, testInput);

      await db.insert(workflowVersions).values({
        workflowId,
        version: 1,
        steps: result.steps,
        inputSchema: result.inputSchema,
        outputSchema: result.outputSchema,
        createdBy: "ai-planner",
      });

      await db
        .update(workflows)
        .set({
          inputSchema: result.inputSchema,
          outputSchema: result.outputSchema,
          name: result.name || prompt.slice(0, 100),
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, workflowId));

      console.log(`[planner] Completed: ${workflowId} (${result.steps.length} steps)`);
      return result;
    } catch (err: any) {
      console.error(`[planner] Failed: ${workflowId}`, err.message);
      // Record failure on the workflow so the UI can surface it
      await db
        .update(workflows)
        .set({
          settings: {
            plannerError: {
              message: err.message || "Planner failed",
              code: err.status === 401 ? "AI_AUTH_ERROR" : "PLANNER_ERROR",
              at: new Date().toISOString(),
            },
          },
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, workflowId))
        .catch(() => {});
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

// ─── Webhook delivery (with retries) ──────────────────────
async function deliverWebhook(
  url: string,
  payload: unknown,
  maxRetries = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AnythingAPI-Webhook/0.1",
          "X-AFA-Event": (payload as any)?.event || "unknown",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        console.log(`[webhook] Delivered to ${url} (status ${res.status})`);
        return;
      }

      // 4xx errors are not retriable
      if (res.status >= 400 && res.status < 500) {
        console.error(`[webhook] Non-retriable ${res.status} from ${url}`);
        return;
      }

      // 5xx — retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[webhook] ${res.status} from ${url}, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    } catch (err: any) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[webhook] Error: ${err.message}, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        console.error(`[webhook] Failed permanently to deliver to ${url}:`, err.message);
      }
    }
  }
}

// ─── Graceful shutdown ────────────────────────────────────
async function shutdown() {
  console.log("[worker] Shutting down...");
  await executionWorker.close();
  await plannerWorker.close();
  await browserPool.shutdown();
  await redis.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("[worker] Ready. Waiting for jobs...");
