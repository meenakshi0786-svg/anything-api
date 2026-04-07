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
    const { runId, workflowId, version, input, userId, webhookUrl } = job.data;

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
    const { workflowId, userId, prompt, testInput } = job.data;
    console.log(`[planner] Planning workflow: ${workflowId} prompt="${prompt}"`);

    // Dynamic import to avoid loading AI modules unless needed
    const { Planner } = await import("./ai/planner.js");
    const planner = new Planner();

    const result = await planner.planWorkflow(prompt, testInput);

    // Save workflow version with generated steps
    const { workflowVersions, workflows } = await import("@afa/db");

    await db.insert(workflowVersions).values({
      workflowId,
      version: 1,
      steps: result.steps,
      inputSchema: result.inputSchema,
      outputSchema: result.outputSchema,
      createdBy: "ai-planner",
    });

    // Update workflow with schemas
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
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

// ─── Webhook delivery ─────────────────────────────────────
async function deliverWebhook(url: string, payload: unknown): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    console.error(`[webhook] Failed to deliver to ${url}:`, err);
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
