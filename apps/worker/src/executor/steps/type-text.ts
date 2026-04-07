import type { ExecutionContext } from "../engine.js";

export async function executeTypeText(
  config: { selector: string; text: string; clear?: boolean; humanlike?: boolean },
  context: ExecutionContext
): Promise<void> {
  const { page } = context.session;

  // Resolve template variables in text
  const text = config.text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path: string) => {
    const parts = path.split(".");
    let value: any = context.variables;
    for (const part of parts) {
      value = value?.[part];
    }
    return String(value ?? "");
  });

  if (config.clear !== false) {
    await page.fill(config.selector, "");
  }

  if (config.humanlike) {
    // Type character by character with random delays
    await page.click(config.selector);
    for (const char of text) {
      await page.keyboard.type(char, { delay: 50 + Math.random() * 150 });
    }
  } else {
    await page.fill(config.selector, text);
  }
}
