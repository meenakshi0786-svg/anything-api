// ════════════════════════════════════════════════════════════
// WORKFLOW TYPES
// ════════════════════════════════════════════════════════════

export type StepType =
  | "navigate"
  | "click"
  | "type_text"
  | "wait_for"
  | "extract"
  | "screenshot"
  | "paginate"
  | "scroll"
  | "condition"
  | "loop"
  | "auth"
  | "api_call"
  | "transform"
  | "ai_decide";

export interface WorkflowStep {
  id: string;
  type: StepType;
  config: Record<string, unknown>;
  dependsOn?: string[];
  timeoutMs?: number;
  retry?: RetryConfig;
}

export interface RetryConfig {
  max: number;
  backoff: "fixed" | "linear" | "exponential";
  delayMs?: number;
}

export interface WorkflowSettings {
  proxy?: "none" | "datacenter" | "residential";
  geo?: string;
  browserProfile?: string;
  maxRuntimeMs?: number;
  cacheTtlS?: number;
}

export interface WorkflowDefinition {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version: number;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  steps: WorkflowStep[];
  settings: WorkflowSettings;
}

export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  description?: string;
  format?: string;
  enum?: string[];
}

export interface CreateWorkflowRequest {
  mode: "ai" | "manual";
  prompt?: string;       // for AI mode
  steps?: WorkflowStep[]; // for manual mode
  name?: string;
  testInput?: Record<string, unknown>;
}

export interface WorkflowResponse {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version: number;
  endpoint: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  stepsCount: number;
  isActive: boolean;
  usageCount: number;
  avgRuntimeMs?: number;
  successRate?: number;
  createdAt: string;
  updatedAt: string;
  testResult?: RunResult;
}
