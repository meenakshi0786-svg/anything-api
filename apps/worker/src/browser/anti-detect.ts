import type { BrowserContext } from "playwright";

/**
 * Anti-detection techniques to make automated browsers
 * appear as regular user sessions.
 */

/**
 * Apply stealth patches to a browser context.
 * Hides common automation signals that websites check.
 */
export async function applyStealthPatches(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    // ─── Navigator overrides ────────────────────────────
    // Hide webdriver flag
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });

    // Realistic plugin list
    Object.defineProperty(navigator, "plugins", {
      get: () => {
        const plugins = [
          { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" },
          { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai" },
          { name: "Native Client", filename: "internal-nacl-plugin" },
        ];
        const pluginArray = Object.create(PluginArray.prototype);
        for (let i = 0; i < plugins.length; i++) {
          pluginArray[i] = plugins[i];
        }
        Object.defineProperty(pluginArray, "length", { value: plugins.length });
        return pluginArray;
      },
    });

    // Realistic language list
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });

    // ─── Chrome runtime mock ────────────────────────────
    // Many sites check for window.chrome
    if (!(window as any).chrome) {
      (window as any).chrome = {
        runtime: {
          onMessage: { addListener: () => {}, removeListener: () => {} },
          sendMessage: () => {},
          connect: () => ({ onMessage: { addListener: () => {} }, postMessage: () => {} }),
        },
        loadTimes: () => ({}),
        csi: () => ({}),
      };
    }

    // ─── Permission API ─────────────────────────────────
    const originalQuery = window.navigator.permissions.query.bind(
      window.navigator.permissions
    );
    window.navigator.permissions.query = (parameters: any) => {
      if (parameters.name === "notifications") {
        return Promise.resolve({
          state: Notification.permission,
        } as PermissionStatus);
      }
      return originalQuery(parameters);
    };

    // ─── Canvas fingerprint noise ───────────────────────
    // Add subtle noise to canvas to prevent fingerprint matching
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: any[]
    ): any {
      const ctx = originalGetContext.call(this, type, ...args);
      if (type === "2d" && ctx) {
        const originalGetImageData = ctx.getImageData.bind(ctx);
        ctx.getImageData = function (...gdArgs: any[]) {
          const imageData = originalGetImageData(...gdArgs);
          // Add very subtle noise (imperceptible visually)
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] += Math.floor(Math.random() * 2) - 1; // R
          }
          return imageData;
        };
      }
      return ctx;
    };

    // ─── WebGL fingerprint noise ────────────────────────
    const getParameterOrig =
      WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (param: number) {
      // Randomize renderer and vendor strings
      if (param === 37445) return "Intel Inc."; // UNMASKED_VENDOR_WEBGL
      if (param === 37446) return "Intel Iris OpenGL Engine"; // UNMASKED_RENDERER_WEBGL
      return getParameterOrig.call(this, param);
    };

    // ─── Prevent iframe detection ───────────────────────
    // Some sites check if they're in an iframe
    try {
      if (window.self !== window.top) {
        Object.defineProperty(window, "self", { get: () => window.top });
      }
    } catch {}
  });
}

/**
 * Generate randomized but realistic browser fingerprint config.
 */
export function generateFingerprint(): {
  viewport: { width: number; height: number };
  userAgent: string;
  locale: string;
  timezoneId: string;
} {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1366, height: 768 },
    { width: 2560, height: 1440 },
    { width: 1680, height: 1050 },
  ];

  const userAgents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  ];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "America/Denver",
    "Europe/London",
    "Europe/Berlin",
  ];

  return {
    viewport: viewports[Math.floor(Math.random() * viewports.length)],
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    locale: "en-US",
    timezoneId: timezones[Math.floor(Math.random() * timezones.length)],
  };
}

/**
 * Simulate human-like mouse movement using Bezier curves.
 */
export async function humanMouseMove(
  page: any,
  toX: number,
  toY: number,
  steps: number = 20
): Promise<void> {
  const fromX = Math.random() * 100;
  const fromY = Math.random() * 100;

  // Control points for Bezier curve
  const cp1x = fromX + (toX - fromX) * 0.3 + (Math.random() - 0.5) * 100;
  const cp1y = fromY + (toY - fromY) * 0.3 + (Math.random() - 0.5) * 100;
  const cp2x = fromX + (toX - fromX) * 0.7 + (Math.random() - 0.5) * 50;
  const cp2y = fromY + (toY - fromY) * 0.7 + (Math.random() - 0.5) * 50;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x =
      Math.pow(1 - t, 3) * fromX +
      3 * Math.pow(1 - t, 2) * t * cp1x +
      3 * (1 - t) * Math.pow(t, 2) * cp2x +
      Math.pow(t, 3) * toX;
    const y =
      Math.pow(1 - t, 3) * fromY +
      3 * Math.pow(1 - t, 2) * t * cp1y +
      3 * (1 - t) * Math.pow(t, 2) * cp2y +
      Math.pow(t, 3) * toY;

    await page.mouse.move(x, y);
    // Variable speed — faster in middle, slower at edges
    const speed = 5 + Math.sin(t * Math.PI) * 15;
    await new Promise((r) => setTimeout(r, speed));
  }
}
