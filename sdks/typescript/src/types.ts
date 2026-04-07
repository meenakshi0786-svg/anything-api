export interface AnythingAPIConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface Workflow {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version?: number;
  endpoint?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  stepsCount?: number;
  isActive?: boolean;
  usageCount?: number;
  avgRuntimeMs?: number;
  successRate?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RunResult {
  [key: string]: unknown;
  _meta?: {
    run_id: string;
    runtime_ms: number;
    cached: boolean;
    version: number;
  };
}

export interface RunResponse {
  id?: string;
  runId?: string;
  status: string;
  workflowId?: string;
  mode?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: { code: string; message: string };
  startedAt?: string;
  completedAt?: string;
  runtimeMs?: number;
  pollUrl?: string;
  estimatedRuntimeMs?: number;
}

export interface ScheduleResponse {
  id: string;
  workflowId?: string;
  cron?: string;
  timezone?: string;
  isActive?: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt?: string;
}

export interface BatchRunResponse {
  batchSize: number;
  runs: Array<{ runId: string; status: string; pollUrl: string }>;
}
