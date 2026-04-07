/**
 * Typed API client for the AnythingAPI backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on init (browser only)
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("afa_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("afa_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("afa_token");
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}/v1${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(error.error?.message || `API error: ${res.status}`);
    }

    if (res.status === 204) return {} as T;
    return res.json();
  }

  // ─── Auth ─────────────────────────────────────────────
  auth = {
    signup: async (body: { name: string; email: string; password: string }) => {
      const res = await this.request<{ data: { token: string; user: any } }>(
        "/auth/signup",
        { method: "POST", body: JSON.stringify(body) }
      );
      this.setToken(res.data.token);
      return res;
    },

    login: async (body: { email: string; password: string }) => {
      const res = await this.request<{ data: { token: string; user: any } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify(body) }
      );
      this.setToken(res.data.token);
      return res;
    },

    getMe: () =>
      this.request<{ data: any }>("/auth/me"),

    logout: () => {
      this.clearToken();
    },
  };

  // ─── Workflows ────────────────────────────────────────
  workflows = {
    list: (page = 1, perPage = 20) =>
      this.request<{ data: any[]; meta: any }>(`/workflows?page=${page}&perPage=${perPage}`),

    get: (id: string) =>
      this.request<{ data: any }>(`/workflows/${id}`),

    create: (body: { mode: string; prompt?: string; name?: string; testInput?: any }) =>
      this.request<{ data: any }>("/workflows", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    delete: (id: string) =>
      this.request<void>(`/workflows/${id}`, { method: "DELETE" }),
  };

  // ─── Runs ─────────────────────────────────────────────
  runs = {
    execute: (slug: string, input: Record<string, unknown>) =>
      this.request<any>(`/run/${slug}`, {
        method: "POST",
        body: JSON.stringify(input),
      }),

    create: (body: { workflowSlug: string; input: any; mode?: string; webhookUrl?: string }) =>
      this.request<{ data: any }>("/runs", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    get: (id: string) =>
      this.request<{ data: any }>(`/runs/${id}`),

    steps: (id: string) =>
      this.request<{ data: any[] }>(`/runs/${id}/steps`),

    logs: (id: string) =>
      this.request<{ data: any[] }>(`/runs/${id}/logs`),

    cancel: (id: string) =>
      this.request<{ data: any }>(`/runs/${id}/cancel`, { method: "POST" }),
  };

  // ─── Schedules ────────────────────────────────────────
  schedules = {
    list: () =>
      this.request<{ data: any[] }>("/schedules"),

    create: (body: { workflowId: string; cron: string; input: any; timezone?: string }) =>
      this.request<{ data: any }>("/schedules", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    delete: (id: string) =>
      this.request<void>(`/schedules/${id}`, { method: "DELETE" }),
  };

  // ─── Studio ───────────────────────────────────────────
  studio = {
    createSession: () =>
      this.request<{ data: any }>("/studio/sessions", { method: "POST" }),

    sendMessage: (sessionId: string, message: string) =>
      fetch(`${this.baseUrl}/v1/studio/sessions/${sessionId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ message }),
      }),
  };
}

export const api = new ApiClient(API_URL);
