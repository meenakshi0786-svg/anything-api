import type { ExecutionContext } from "../engine.js";

export async function executeWaitFor(
  config: {
    selector?: string;
    text?: string;
    state?: "visible" | "hidden" | "attached" | "detached";
    timeout?: number;
    fallback?: "ai";
  },
  context: ExecutionContext
): Promise<void> {
  const { page } = context.session;
  const timeout = config.timeout || 10000;

  if (config.selector) {
    await page.waitForSelector(config.selector, {
      state: config.state || "visible",
      timeout,
    });
    return;
  }

  if (config.text) {
    await page.waitForFunction(
      (text: string) => document.body.innerText.includes(text),
      config.text,
      { timeout }
    );
    return;
  }

  // Default: wait for network idle
  await page.waitForLoadState("networkidle", { timeout });
}
