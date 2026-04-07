import type { ExecutionContext } from "../engine.js";
import { executeExtract } from "./extract.js";

/**
 * Paginate through multiple pages, extracting data from each.
 */
export async function executePaginate(
  config: {
    nextSelector?: string;
    nextText?: string;
    maxPages?: number;
    extractPerPage: {
      strategy: "selector" | "ai" | "hybrid";
      selectors?: Record<string, string>;
      prompt?: string;
      fields?: string[];
    };
    target: string; // key name for aggregated results
  },
  context: ExecutionContext
): Promise<Record<string, unknown>[]> {
  const maxPages = config.maxPages || 5;
  const allResults: Record<string, unknown>[] = [];

  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    // Extract data from current page
    const pageData = await executeExtract(
      {
        strategy: config.extractPerPage.strategy,
        selectors: config.extractPerPage.selectors,
        aiPrompt: config.extractPerPage.prompt,
        fields: config.extractPerPage.fields,
      },
      context
    );

    // If result is an array, spread it; otherwise push as single item
    const items = Array.isArray(pageData) ? pageData : [pageData];
    allResults.push(...items);

    // Try to go to next page
    if (pageNum < maxPages - 1) {
      try {
        const { page } = context.session;

        if (config.nextSelector) {
          const nextButton = await page.$(config.nextSelector);
          if (!nextButton) break; // No more pages

          await nextButton.click();
          await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
          // Wait for content to update
          await page.waitForTimeout(1000);
        } else if (config.nextText) {
          const nextButton = page.getByText(config.nextText);
          const count = await nextButton.count();
          if (count === 0) break;

          await nextButton.click();
          await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
          await page.waitForTimeout(1000);
        } else {
          break; // No pagination method specified
        }
      } catch {
        break; // Pagination failed (likely last page)
      }
    }
  }

  // Store under the target key in context
  context.variables[config.target] = allResults;
  return allResults;
}
