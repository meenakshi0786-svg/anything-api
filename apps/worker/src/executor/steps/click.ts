import type { ExecutionContext } from "../engine.js";

/**
 * Click an element by CSS selector.
 * Falls back to AI-based element location if selector fails.
 */
export async function executeClick(
  config: { selector?: string; text?: string; fallback?: "ai" },
  context: ExecutionContext
): Promise<void> {
  const { page } = context.session;

  if (config.selector) {
    try {
      await page.click(config.selector, { timeout: 10000 });
      return;
    } catch (err) {
      if (config.fallback !== "ai") throw err;
      // Fall through to AI-based click
    }
  }

  // AI fallback: find element by description
  if (config.text) {
    // Try text-based selection
    const element = page.getByText(config.text, { exact: false });
    await element.click({ timeout: 10000 });
    return;
  }

  throw new Error("Click step requires either selector or text");
}
