import type { ExecutionContext } from "../engine.js";

/**
 * Navigate to a URL.
 * Supports template variables: {{input.url}}, {{step_1.redirectUrl}}
 */
export async function executeNavigate(
  config: { url: string; waitUntil?: "load" | "domcontentloaded" | "networkidle" },
  context: ExecutionContext
): Promise<{ url: string; title: string }> {
  // Resolve template variables
  const url = resolveTemplate(config.url, context.variables);

  await context.session.goto(url, { waitUntil: config.waitUntil });

  const title = await context.session.page.title();
  const finalUrl = context.session.page.url();

  return { url: finalUrl, title };
}

function resolveTemplate(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path: string) => {
    const parts = path.split(".");
    let value: any = variables;
    for (const part of parts) {
      value = value?.[part];
    }
    return String(value ?? "");
  });
}
