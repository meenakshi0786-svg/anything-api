import { db } from "@afa/db";
import { workflowVersions, runSteps, runLogs } from "@afa/db";
import { eq, and } from "drizzle-orm";
import type { BrowserPool } from "../browser/pool.js";
import type { BrowserSession } from "../browser/session.js";
import type { WorkflowStep } from "@afa/types";

// Step handlers
import { executeNavigate } from "./steps/navigate.js";
import { executeClick } from "./steps/click.js";
import { executeExtract } from "./steps/extract.js";
import { executeTypeText } from "./steps/type-text.js";
import { executeWaitFor } from "./steps/wait-for.js";
import { executePaginate } from "./steps/paginate.js";
import { executeScroll } from "./steps/scroll.js";
import { executeTransform } from "./steps/transform.js";
import { executeAiDecide } from "./steps/ai-decide.js";

export interface ExecutionConfig {
  browserPool: BrowserPool;
  runId: string;
  workflowId: string;
  version: number;
  input: Record<string, unknown>;
  userId: string;
}

export interface ExecutionResult {
  output: Record<string, unknown>;
  runtimeMs: number;
  browserMs: number;
  stepCount: number;
  cached: boolean;
}

export interface ExecutionContext {
  runId: string;
  input: Record<string, unknown>;
  session: BrowserSession;
  variables: Record<string, unknown>; // data passed between steps
  screenshots: string[];
}

const STEP_HANDLERS: Record<string, Function> = {
  navigate: executeNavigate,
  click: executeClick,
  extract: executeExtract,
  type_text: executeTypeText,
  wait_for: executeWaitFor,
  paginate: executePaginate,
  scroll: executeScroll,
  transform: executeTransform,
  ai_decide: executeAiDecide,
};

export class ExecutionEngine {
  private config: ExecutionConfig;

  constructor(config: ExecutionConfig) {
    this.config = config;
  }

  async execute(): Promise<ExecutionResult> {
    const startTime = Date.now();
    let browserStartTime = 0;

    // Fetch workflow steps
    const [version] = await db
      .select()
      .from(workflowVersions)
      .where(
        and(
          eq(workflowVersions.workflowId, this.config.workflowId),
          eq(workflowVersions.version, this.config.version)
        )
      )
      .limit(1);

    if (!version) {
      throw Object.assign(new Error("Workflow version not found"), {
        code: "VERSION_NOT_FOUND",
      });
    }

    const steps = version.steps as WorkflowStep[];

    // Acquire browser session
    const session = await this.config.browserPool.acquire();
    browserStartTime = Date.now();

    const context: ExecutionContext = {
      runId: this.config.runId,
      input: this.config.input,
      session,
      variables: { ...this.config.input },
      screenshots: [],
    };

    try {
      // Execute steps in dependency order
      const completed = new Set<string>();

      for (const step of this.topologicalSort(steps)) {
        // Check dependencies are met
        if (step.dependsOn?.some((dep) => !completed.has(dep))) {
          throw Object.assign(
            new Error(`Dependency not met for step ${step.id}`),
            { code: "DEPENDENCY_ERROR", stepId: step.id }
          );
        }

        await this.executeStep(step, context);
        completed.add(step.id);
      }

      const browserMs = Date.now() - browserStartTime;
      const runtimeMs = Date.now() - startTime;

      return {
        output: context.variables,
        runtimeMs,
        browserMs,
        stepCount: steps.length,
        cached: false,
      };
    } finally {
      // Always release the browser session
      await this.config.browserPool.release(session);
    }
  }

  private async executeStep(
    step: WorkflowStep,
    context: ExecutionContext
  ): Promise<void> {
    const handler = STEP_HANDLERS[step.type];
    if (!handler) {
      throw Object.assign(
        new Error(`Unknown step type: ${step.type}`),
        { code: "UNKNOWN_STEP_TYPE", stepId: step.id }
      );
    }

    // Record step start
    const [stepRecord] = await db
      .insert(runSteps)
      .values({
        runId: context.runId,
        stepId: step.id,
        status: "running",
        startedAt: new Date(),
      })
      .returning();

    const stepStart = Date.now();
    let retries = 0;
    const maxRetries = step.retry?.max || 0;

    while (true) {
      try {
        // Apply timeout
        const timeoutMs = step.timeoutMs || 15000;
        const result = await Promise.race([
          handler(step.config, context),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Step ${step.id} timed out after ${timeoutMs}ms`)),
              timeoutMs
            )
          ),
        ]);

        // Store step output in context variables
        if (result !== undefined) {
          context.variables[step.id] = result;
        }

        // Record step completion
        await db
          .update(runSteps)
          .set({
            status: "completed",
            completedAt: new Date(),
            runtimeMs: Date.now() - stepStart,
            output: result !== undefined ? result : null,
          })
          .where(eq(runSteps.id, stepRecord.id));

        // Log success
        await this.log(context.runId, step.id, "info", `Step ${step.id} completed`);
        return;
      } catch (error: any) {
        retries++;
        if (retries > maxRetries) {
          // Record step failure
          await db
            .update(runSteps)
            .set({
              status: "failed",
              completedAt: new Date(),
              runtimeMs: Date.now() - stepStart,
              error: { code: error.code || "STEP_ERROR", message: error.message },
            })
            .where(eq(runSteps.id, stepRecord.id));

          await this.log(context.runId, step.id, "error", error.message);

          throw Object.assign(error, { stepId: step.id });
        }

        // Retry with backoff
        const delay = this.calculateBackoff(retries, step.retry);
        await this.log(
          context.runId,
          step.id,
          "warn",
          `Step failed, retrying (${retries}/${maxRetries}) after ${delay}ms: ${error.message}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private calculateBackoff(
    attempt: number,
    config?: { backoff?: string; delayMs?: number }
  ): number {
    const base = config?.delayMs || 1000;
    switch (config?.backoff) {
      case "linear":
        return base * attempt;
      case "exponential":
        return base * Math.pow(2, attempt - 1);
      default:
        return base;
    }
  }

  /**
   * Topological sort of steps based on dependsOn.
   * Returns steps in execution order.
   */
  private topologicalSort(steps: WorkflowStep[]): WorkflowStep[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const stepMap = new Map<string, WorkflowStep>();

    for (const step of steps) {
      stepMap.set(step.id, step);
      graph.set(step.id, []);
      inDegree.set(step.id, 0);
    }

    for (const step of steps) {
      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          graph.get(dep)?.push(step.id);
          inDegree.set(step.id, (inDegree.get(step.id) || 0) + 1);
        }
      }
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const sorted: WorkflowStep[] = [];
    while (queue.length > 0) {
      const id = queue.shift()!;
      sorted.push(stepMap.get(id)!);

      for (const neighbor of graph.get(id) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    if (sorted.length !== steps.length) {
      throw new Error("Circular dependency detected in workflow steps");
    }

    return sorted;
  }

  private async log(
    runId: string,
    stepId: string,
    level: string,
    message: string
  ): Promise<void> {
    await db.insert(runLogs).values({ runId, stepId, level, message }).catch(() => {});
  }
}
