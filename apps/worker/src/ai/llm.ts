/**
 * Centralized LLM client with model selection,
 * token tracking, and retry logic.
 *
 * Supports THREE providers (auto-detected from env):
 *   1. OpenAI     — set OPENAI_API_KEY     (uses GPT-4o)
 *   2. Anthropic  — set ANTHROPIC_API_KEY   (uses Claude)
 *   3. OpenRouter — set OPENROUTER_API_KEY  (routes to any model)
 *
 * Priority: OpenAI > Anthropic > OpenRouter
 */

export type ModelTier = "fast" | "balanced" | "powerful";

// ─── OpenAI models ───────────────────────────────────────
const OPENAI_MODELS: Record<ModelTier, string> = {
  fast: "gpt-4o-mini",
  balanced: "gpt-4o",
  powerful: "gpt-4o",
};

// ─── Anthropic direct models ─────────────────────────────
const ANTHROPIC_MODELS: Record<ModelTier, string> = {
  fast: "claude-haiku-4-5-20251001",
  balanced: "claude-sonnet-4-6-20250514",
  powerful: "claude-opus-4-6-20250414",
};

// ─── OpenRouter model IDs ────────────────────────────────
const OPENROUTER_MODELS: Record<ModelTier, string> = {
  fast: "anthropic/claude-haiku-4-5-20251001",
  balanced: "anthropic/claude-sonnet-4-6-20250514",
  powerful: "anthropic/claude-opus-4-6-20250414",
};

type Provider = "openai" | "anthropic" | "openrouter";

function detectProvider(): Provider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  throw new Error(
    "No AI API key found. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY in .env"
  );
}

export interface LLMRequest {
  system?: string;
  prompt: string;
  tier?: ModelTier;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface LLMResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

/**
 * Send a prompt and get a response.
 * Auto-selects provider based on available API keys.
 */
export async function llm(request: LLMRequest): Promise<LLMResponse> {
  const provider = detectProvider();

  switch (provider) {
    case "openai":
      return llmOpenAI(request);
    case "anthropic":
      return llmAnthropic(request);
    case "openrouter":
      return llmOpenRouter(request);
  }
}

// ─── OpenAI ──────────────────────────────────────────────
async function llmOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const model = OPENAI_MODELS[request.tier || "fast"];

  return withRetry(async () => {
    const messages: any[] = [];
    if (request.system) {
      messages.push({ role: "system", content: request.system });
    }
    messages.push({ role: "user", content: request.prompt });

    const body: any = {
      model,
      messages,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.7,
    };

    // Enable JSON mode if requested
    if (request.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const error: any = new Error(
        err.error?.message || `OpenAI error: ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      text,
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
      model,
    };
  });
}

// ─── Anthropic Direct ────────────────────────────────────
async function llmAnthropic(request: LLMRequest): Promise<LLMResponse> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic();
  const model = ANTHROPIC_MODELS[request.tier || "fast"];

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature,
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      model,
    };
  });
}

// ─── OpenRouter ──────────────────────────────────────────
async function llmOpenRouter(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY!;
  const model = OPENROUTER_MODELS[request.tier || "fast"];

  return withRetry(async () => {
    const messages: any[] = [];
    if (request.system) {
      messages.push({ role: "system", content: request.system });
    }
    messages.push({ role: "user", content: request.prompt });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://anythingapi.com",
        "X-Title": "API for Anything",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const error: any = new Error(
        err.error?.message || `OpenRouter error: ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      text,
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
      model,
    };
  });
}

// ─── Retry wrapper ───────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (error.status === 401 || error.status === 400) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `[llm] Attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error("LLM request failed after retries");
}

/**
 * Parse JSON from LLM response, handling markdown code blocks.
 */
export function parseJsonResponse<T = unknown>(text: string): T {
  try {
    return JSON.parse(text);
  } catch {}

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return JSON.parse(arrayMatch[0]);
  }

  throw new Error("Could not parse JSON from LLM response");
}
