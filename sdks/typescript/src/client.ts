import type {
  AnythingAPIConfig,
  Workflow,
  RunResult,
  RunResponse,
  ScheduleResponse,
  BatchRunResponse,
} from "./types";

/**
 * Official TypeScript SDK for API for Anything.
 *
 * @example
 * ```ts
 * import { AnythingAPI } from '@anythingapi/sdk';
 *
 * const client = new AnythingAPI({ apiKey: 'afa_sk_live_xxx' });
 *
 * // Create workflow from natural language
 * const workflow = await client.workflows.create({
 *   prompt: 'Get product price from any Amazon URL',
 *   testInput: { url: 'https://amazon.com/dp/B09V3KXJPB' },
 * });
 *
 * // Run it
 * const result = await client.run('amazon-product-scraper', {
 *   url: 'https://amazon.com/dp/B09V3KXJPB',
 * });
 * console.log(result.title, result.price);
 * ```
 */
export class AnythingAPI {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  public workflows: WorkflowsClient;
  public runs: RunsClient;
  public schedules: SchedulesClient;

  constructor(config: AnythingAPIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://api.anythingapi.com/v1").replace(
      /\/$/,
      ""
    );
    this.timeout = config.timeout || 120000;

    this.workflows = new WorkflowsClient(this);
    this.runs = new RunsClient(this);
    this.schedules = new SchedulesClient(this);
  }

  /** Run a workflow synchronously — simplest usage. */
  async run(
    workflowSlug: string,
    input: Record<string, unknown> = {}
  ): Promise<RunResult> {
    return this.request<RunResult>(`/run/${workflowSlug}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /** Internal HTTP client. */
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": "anythingapi-ts/0.1.0",
      ...(init.headers as Record<string, string>),
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({
        error: { message: res.statusText },
      }));
      throw new Error(err.error?.message || `API error: ${res.status}`);
    }

    if (res.status === 204) return {} as T;
    return res.json();
  }
}

class WorkflowsClient {
  constructor(private client: AnythingAPI) {}

  async create(params: {
    prompt?: string;
    name?: string;
    steps?: unknown[];
    testInput?: Record<string, unknown>;
  }): Promise<Workflow> {
    const res = await this.client.request<{ data: Workflow }>("/workflows", {
      method: "POST",
      body: JSON.stringify({
        mode: params.prompt ? "ai" : "manual",
        ...params,
      }),
    });
    return res.data;
  }

  async list(page = 1, perPage = 20): Promise<Workflow[]> {
    const res = await this.client.request<{ data: Workflow[] }>(
      `/workflows?page=${page}&perPage=${perPage}`
    );
    return res.data;
  }

  async get(id: string): Promise<Workflow> {
    const res = await this.client.request<{ data: Workflow }>(
      `/workflows/${id}`
    );
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.client.request(`/workflows/${id}`, { method: "DELETE" });
  }
}

class RunsClient {
  constructor(private client: AnythingAPI) {}

  async create(params: {
    workflowSlug: string;
    input?: Record<string, unknown>;
    mode?: "async" | "stream";
    webhookUrl?: string;
  }): Promise<RunResponse> {
    const res = await this.client.request<{ data: RunResponse }>("/runs", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data;
  }

  async get(runId: string): Promise<RunResponse> {
    const res = await this.client.request<{ data: RunResponse }>(
      `/runs/${runId}`
    );
    return res.data;
  }

  async wait(
    runId: string,
    pollIntervalMs = 1000,
    timeoutMs = 300000
  ): Promise<RunResponse> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const run = await this.get(runId);
      if (["completed", "failed", "cancelled"].includes(run.status)) {
        return run;
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
    throw new Error(`Run ${runId} did not complete within ${timeoutMs}ms`);
  }

  async batch(params: {
    workflowId: string;
    inputs: Record<string, unknown>[];
    concurrency?: number;
    webhookUrl?: string;
  }): Promise<BatchRunResponse> {
    const res = await this.client.request<{ data: BatchRunResponse }>(
      "/runs/batch",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
    return res.data;
  }

  async cancel(runId: string): Promise<void> {
    await this.client.request(`/runs/${runId}/cancel`, { method: "POST" });
  }

  /** Stream execution events via SSE. */
  async *stream(
    workflowSlug: string,
    input: Record<string, unknown>
  ): AsyncGenerator<{ type: string; data: unknown }> {
    const run = await this.create({
      workflowSlug,
      input,
      mode: "stream",
    });

    // TODO: Implement SSE streaming
    yield { type: "run.started", data: { runId: run.runId } };
  }
}

class SchedulesClient {
  constructor(private client: AnythingAPI) {}

  async create(params: {
    workflowId: string;
    cron: string;
    input?: Record<string, unknown>;
    timezone?: string;
    webhookUrl?: string;
  }): Promise<ScheduleResponse> {
    const res = await this.client.request<{ data: ScheduleResponse }>(
      "/schedules",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
    return res.data;
  }

  async list(): Promise<ScheduleResponse[]> {
    const res = await this.client.request<{ data: ScheduleResponse[] }>(
      "/schedules"
    );
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.client.request(`/schedules/${id}`, { method: "DELETE" });
  }
}
