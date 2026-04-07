import type { BrowserContext, Page } from "playwright";

/**
 * Wraps a Playwright browser context + page with
 * convenience methods for workflow execution.
 */
export class BrowserSession {
  public readonly id: string;
  public readonly context: BrowserContext;
  public readonly page: Page;

  constructor(context: BrowserContext, page: Page) {
    this.id = crypto.randomUUID();
    this.context = context;
    this.page = page;
  }

  async goto(url: string, options?: { waitUntil?: "load" | "domcontentloaded" | "networkidle" }): Promise<void> {
    await this.page.goto(url, {
      waitUntil: options?.waitUntil || "domcontentloaded",
      timeout: 30000,
    });
  }

  async click(selector: string): Promise<void> {
    await this.page.click(selector, { timeout: 10000 });
  }

  async type(selector: string, text: string): Promise<void> {
    await this.page.fill(selector, text);
  }

  async waitFor(selector: string, timeoutMs = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout: timeoutMs });
  }

  async screenshot(): Promise<Buffer> {
    return await this.page.screenshot({ fullPage: true });
  }

  async getContent(): Promise<string> {
    return await this.page.content();
  }

  async evaluate<T>(fn: string | (() => T)): Promise<T> {
    return await this.page.evaluate(fn);
  }

  /**
   * Get a simplified DOM snapshot for AI consumption.
   * Strips scripts, styles, and reduces noise.
   */
  async getSimplifiedDOM(): Promise<string> {
    return await this.page.evaluate(() => {
      const clone = document.documentElement.cloneNode(true) as HTMLElement;

      // Remove noise elements
      const remove = clone.querySelectorAll(
        "script, style, noscript, svg, link[rel=stylesheet], meta, iframe"
      );
      remove.forEach((el) => el.remove());

      // Simplify: keep only visible text content and interactive elements
      return clone.innerHTML
        .replace(/\s+/g, " ")
        .replace(/<!--[\s\S]*?-->/g, "")
        .trim()
        .slice(0, 50000); // Limit for LLM context
    });
  }

  async close(): Promise<void> {
    await this.page.close().catch(() => {});
    await this.context.close().catch(() => {});
  }
}
