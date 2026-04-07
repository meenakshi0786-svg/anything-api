import type { ExecutionContext } from "../engine.js";
import { llm, parseJsonResponse } from "../../ai/llm.js";

/**
 * Extract data from the current page.
 *
 * Strategies:
 *   - "selector": use CSS selectors to extract specific fields
 *   - "ai": use LLM to extract structured data from page content
 *   - "hybrid": try selectors first, AI fallback for missing fields
 */
export async function executeExtract(
  config: {
    strategy: "selector" | "ai" | "hybrid";
    selectors?: Record<string, string>;
    aiPrompt?: string;
    aiFallback?: boolean;
    fields?: string[];
  },
  context: ExecutionContext
): Promise<Record<string, unknown>> {
  const { page } = context.session;
  let result: Record<string, unknown> = {};

  // ─── Selector-based extraction ──────────────────────────
  if (config.strategy === "selector" || config.strategy === "hybrid") {
    if (config.selectors) {
      for (const [field, selector] of Object.entries(config.selectors)) {
        try {
          const element = await page.$(selector);
          if (element) {
            result[field] = await element.textContent();
            // Clean up whitespace
            if (typeof result[field] === "string") {
              result[field] = (result[field] as string).trim();
            }
          }
        } catch {
          // Selector failed — will be handled by AI fallback if hybrid
        }
      }
    }
  }

  // ─── AI-based extraction ────────────────────────────────
  const needsAI =
    config.strategy === "ai" ||
    (config.strategy === "hybrid" && config.aiFallback !== false);

  if (needsAI) {
    // Check if we still need to extract fields
    const missingFields = config.fields?.filter((f) => !result[f]) || [];
    const shouldRunAI =
      config.strategy === "ai" || missingFields.length > 0;

    if (shouldRunAI) {
      const dom = await context.session.getSimplifiedDOM();
      const aiResult = await extractWithAI(dom, config.aiPrompt, missingFields);

      // Merge AI results (selector results take priority)
      result = { ...aiResult, ...result };
    }
  }

  return result;
}

async function extractWithAI(
  pageContent: string,
  prompt?: string,
  fields?: string[]
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are a web data extraction expert. Extract structured data from the given HTML content.
Return ONLY valid JSON — no markdown, no explanation, no code blocks.
If a field cannot be found, set its value to null.`;

  const userPrompt = prompt
    ? `${prompt}\n\nExtract from this page:\n${pageContent.slice(0, 30000)}`
    : `Extract the following fields as JSON: ${fields?.join(", ")}\n\nFrom this page:\n${pageContent.slice(0, 30000)}`;

  const response = await llm({
    system: systemPrompt,
    prompt: userPrompt,
    tier: "fast",
    maxTokens: 4096,
  });

  return parseJsonResponse<Record<string, unknown>>(response.text);
}
