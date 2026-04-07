import type { FastifyRequest } from "fastify";
import { db } from "@afa/db";
import { usageRecords } from "@afa/db";
import type { AuthContext } from "./auth.js";

/**
 * Record a usage event for billing.
 * Called after each workflow run completes.
 */
export async function recordUsage(params: {
  userId: string;
  teamId?: string;
  runId: string;
  metric: "browser_ms" | "proxy_bytes" | "run_count" | "ai_tokens";
  quantity: number;
}): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  await db.insert(usageRecords).values({
    userId: params.userId,
    teamId: params.teamId,
    runId: params.runId,
    metric: params.metric,
    quantity: params.quantity,
    periodStart: today,
  });
}

/**
 * Plan limits for rate limiting and quota enforcement.
 */
export const PLAN_LIMITS = {
  free: {
    runsPerMonth: 100,
    browserHours: 5,
    concurrentSessions: 2,
    workflows: 5,
    schedules: 1,
  },
  pro: {
    runsPerMonth: 5000,
    browserHours: 100,
    concurrentSessions: 10,
    workflows: 50,
    schedules: 20,
  },
  team: {
    runsPerMonth: 25000,
    browserHours: 500,
    concurrentSessions: 50,
    workflows: -1, // unlimited
    schedules: 100,
  },
  enterprise: {
    runsPerMonth: -1,
    browserHours: -1,
    concurrentSessions: -1,
    workflows: -1,
    schedules: -1,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;
