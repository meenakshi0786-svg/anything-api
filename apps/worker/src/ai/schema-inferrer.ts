import { llm, parseJsonResponse } from "./llm.js";
import type { JsonSchema } from "@afa/types";

/**
 * Infer JSON Schema from:
 * 1. A natural language description of what data to extract
 * 2. Sample extracted data (after a test run)
 */
export class SchemaInferrer {
  /**
   * Infer output schema from a user's natural language prompt.
   */
  async inferFromPrompt(prompt: string): Promise<{
    inputSchema: JsonSchema;
    outputSchema: JsonSchema;
  }> {
    const response = await llm({
      prompt: `Given this web automation task description, infer the API input and output JSON schemas.

Task: "${prompt}"

Return ONLY valid JSON with this structure:
{
  "inputSchema": { JSON Schema for what the user provides },
  "outputSchema": { JSON Schema for what the API returns }
}

Use standard JSON Schema types (string, number, integer, boolean, array, object).
Include "description" for each field to document it.
Mark required fields.`,
      tier: "fast",
      maxTokens: 2048,
    });

    return parseJsonResponse(response.text);
  }

  /**
   * Infer/refine output schema from actual extracted data.
   */
  inferFromSample(data: unknown): JsonSchema {
    return this.inferType(data);
  }

  private inferType(value: unknown): JsonSchema {
    if (value === null || value === undefined) {
      return { type: "string" };
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { type: "array", items: { type: "string" } };
      }
      return {
        type: "array",
        items: this.inferType(value[0]),
      };
    }

    if (typeof value === "object") {
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];

      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        properties[key] = this.inferType(val);
        if (val !== null && val !== undefined) {
          required.push(key);
        }
      }

      return {
        type: "object",
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    if (typeof value === "number") {
      return Number.isInteger(value)
        ? { type: "integer" }
        : { type: "number" };
    }

    if (typeof value === "boolean") {
      return { type: "boolean" };
    }

    // String — detect formats
    const str = String(value);
    if (/^https?:\/\//.test(str)) {
      return { type: "string", format: "uri" };
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return { type: "string", format: "date-time" };
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
      return { type: "string", format: "email" };
    }

    return { type: "string" };
  }
}
