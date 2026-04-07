import type { ExecutionContext } from "../engine.js";
import { llm, parseJsonResponse } from "../../ai/llm.js";

/**
 * AI decision step: the LLM observes the page state and decides
 * what action to take. Used for dynamic, unpredictable pages.
 */
export async function executeAiDecide(
  config: {
    prompt: string;
    options?: string[];
    outputKey?: string;
  },
  context: ExecutionContext
): Promise<unknown> {
  const dom = await context.session.getSimplifiedDOM();
  const url = context.session.page.url();

  const systemPrompt = `You are an AI agent controlling a web browser. You are currently on: ${url}

Your task: ${config.prompt}

Current page DOM (simplified):
${dom.slice(0, 20000)}

${config.options ? `Available actions: ${config.options.join(", ")}` : ""}

Respond with a JSON object containing:
- "action": the action to take (click, type, scroll, extract, wait, or done)
- "selector": CSS selector for the target element (if applicable)
- "value": value to type or extracted data (if applicable)
- "reasoning": brief explanation of your decision

Return ONLY valid JSON.`;

  const response = await llm({
    prompt: systemPrompt,
    tier: "fast",
    maxTokens: 2048,
  });

  const decision: any = parseJsonResponse(response.text);

  // Execute the decided action
  const { page } = context.session;

  switch (decision.action) {
    case "click":
      if (decision.selector) {
        await page.click(decision.selector);
      }
      break;

    case "type":
      if (decision.selector && decision.value) {
        await page.fill(decision.selector, String(decision.value));
      }
      break;

    case "scroll":
      await page.evaluate(() => window.scrollBy(0, 500));
      break;

    case "wait":
      await page.waitForTimeout(2000);
      break;

    case "extract":
    case "done":
      // Return the extracted data
      if (config.outputKey && decision.value) {
        context.variables[config.outputKey] = decision.value;
      }
      return decision.value;
  }

  return decision;
}
