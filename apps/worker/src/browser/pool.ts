import { chromium, type Browser, type BrowserContext } from "playwright";
import { BrowserSession } from "./session.js";

export interface PoolConfig {
  maxConcurrent: number;
  recycleAfterRuns: number;
}

interface PooledBrowser {
  browser: Browser;
  runCount: number;
  createdAt: number;
}

/**
 * Manages a pool of Playwright browser instances.
 * Reuses browsers across runs, recycling them after N runs
 * to prevent memory leaks.
 */
export class BrowserPool {
  private config: PoolConfig;
  private idle: PooledBrowser[] = [];
  private active = new Map<string, PooledBrowser>();
  private waitQueue: Array<(session: BrowserSession) => void> = [];

  constructor(config: PoolConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Pre-warm 2 browsers
    const warmCount = Math.min(2, this.config.maxConcurrent);
    for (let i = 0; i < warmCount; i++) {
      const pooled = await this.createBrowser();
      this.idle.push(pooled);
    }
    console.log(`[pool] Initialized with ${warmCount} warm browsers`);
  }

  async acquire(): Promise<BrowserSession> {
    // Try to get an idle browser
    if (this.idle.length > 0) {
      const pooled = this.idle.pop()!;
      return this.createSession(pooled);
    }

    // If under limit, create a new one
    if (this.active.size < this.config.maxConcurrent) {
      const pooled = await this.createBrowser();
      return this.createSession(pooled);
    }

    // Wait for one to become available
    return new Promise((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  async release(session: BrowserSession): Promise<void> {
    await session.close();

    const pooled = this.active.get(session.id);
    if (!pooled) return;

    this.active.delete(session.id);
    pooled.runCount++;

    // Recycle if too many runs
    if (pooled.runCount >= this.config.recycleAfterRuns) {
      await pooled.browser.close().catch(() => {});
      console.log(`[pool] Recycled browser after ${pooled.runCount} runs`);
    } else {
      // Return to idle pool
      this.idle.push(pooled);
    }

    // Serve waiting requests
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      const newSession = await this.acquire();
      resolve(newSession);
    }
  }

  async shutdown(): Promise<void> {
    // Close all browsers
    for (const pooled of this.idle) {
      await pooled.browser.close().catch(() => {});
    }
    for (const [, pooled] of this.active) {
      await pooled.browser.close().catch(() => {});
    }
    this.idle = [];
    this.active.clear();
    console.log("[pool] All browsers closed");
  }

  private async createBrowser(): Promise<PooledBrowser> {
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    return {
      browser,
      runCount: 0,
      createdAt: Date.now(),
    };
  }

  private async createSession(pooled: PooledBrowser): Promise<BrowserSession> {
    const context = await pooled.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "America/New_York",
    });

    const page = await context.newPage();
    const session = new BrowserSession(context, page);

    this.active.set(session.id, pooled);
    return session;
  }
}
