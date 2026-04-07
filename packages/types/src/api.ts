// ════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiListMeta;
}

export interface ApiMeta {
  requestId: string;
}

export interface ApiListMeta extends ApiMeta {
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: ApiMeta;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// API Key types
export interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
  rateLimitRpm?: number;
  expiresAt?: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimitRpm: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  // key is only returned on creation
  key?: string;
}

// Studio types
export interface StudioMessage {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    workflow?: Record<string, unknown>;
    testResult?: Record<string, unknown>;
    screenshots?: string[];
  };
}

export interface StudioSession {
  id: string;
  messages: StudioMessage[];
  currentWorkflow?: Record<string, unknown>;
  createdAt: string;
}
