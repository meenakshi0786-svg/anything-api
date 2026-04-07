// ════════════════════════════════════════════════════════════
// RUN / EXECUTION TYPES
// ════════════════════════════════════════════════════════════

export type RunStatus =
  | "queued"
  | "starting"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type RunMode = "sync" | "async" | "batch" | "scheduled" | "stream";

export interface RunRequest {
  workflowId?: string;
  workflowSlug?: string;
  input: Record<string, unknown>;
  mode?: RunMode;
  webhookUrl?: string;
}

export interface BatchRunRequest {
  workflowId: string;
  inputs: Record<string, unknown>[];
  concurrency?: number;
  webhookUrl?: string;
}

export interface RunResult {
  runId: string;
  status: RunStatus;
  output?: Record<string, unknown>;
  error?: RunError;
  runtimeMs?: number;
  cached?: boolean;
  version?: number;
}

export interface RunError {
  code: string;
  message: string;
  stepId?: string;
  screenshotUrl?: string;
}

export interface RunStepResult {
  stepId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  runtimeMs?: number;
  output?: unknown;
  error?: RunError;
  screenshotUrl?: string;
  aiReasoning?: string;
}

export interface RunResponse {
  id: string;
  workflowId: string;
  status: RunStatus;
  mode: RunMode;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: RunError;
  startedAt?: string;
  completedAt?: string;
  runtimeMs?: number;
  stepCount?: number;
  steps?: RunStepResult[];
  createdAt: string;
}

// SSE events for streaming execution
export type RunEvent =
  | { type: "run.started"; runId: string }
  | { type: "step.started"; runId: string; stepId: string }
  | { type: "step.completed"; runId: string; stepId: string; output: unknown }
  | { type: "step.failed"; runId: string; stepId: string; error: RunError }
  | { type: "run.completed"; runId: string; output: Record<string, unknown> }
  | { type: "run.failed"; runId: string; error: RunError }
  | { type: "log"; runId: string; level: string; message: string };

export interface ScheduleRequest {
  workflowId: string;
  cron: string;
  timezone?: string;
  input: Record<string, unknown>;
  webhookUrl?: string;
}

export interface ScheduleResponse {
  id: string;
  workflowId: string;
  cron: string;
  timezone: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
}
