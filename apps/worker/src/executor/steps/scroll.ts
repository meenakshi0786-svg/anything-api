import type { ExecutionContext } from "../engine.js";

export async function executeScroll(
  config: {
    direction?: "down" | "up";
    distance?: number;
    selector?: string;
    infinite?: boolean;
    maxScrolls?: number;
    waitMs?: number;
  },
  context: ExecutionContext
): Promise<{ scrolled: boolean; finalHeight: number }> {
  const { page } = context.session;

  if (config.infinite) {
    // Infinite scroll: keep scrolling until no new content loads
    const maxScrolls = config.maxScrolls || 10;
    let previousHeight = 0;

    for (let i = 0; i < maxScrolls; i++) {
      const currentHeight = await page.evaluate(() => document.body.scrollHeight);
      if (currentHeight === previousHeight) break;

      previousHeight = currentHeight;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(config.waitMs || 2000);
    }

    const finalHeight = await page.evaluate(() => document.body.scrollHeight);
    return { scrolled: true, finalHeight };
  }

  // Simple scroll
  const distance = config.distance || 500;
  const direction = config.direction || "down";

  if (config.selector) {
    await page.locator(config.selector).scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(
      ({ dist, dir }) => {
        window.scrollBy(0, dir === "down" ? dist : -dist);
      },
      { dist: distance, dir: direction }
    );
  }

  const finalHeight = await page.evaluate(() => document.body.scrollHeight);
  return { scrolled: true, finalHeight };
}
