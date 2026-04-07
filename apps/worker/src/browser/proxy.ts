/**
 * Proxy rotation and management for browser sessions.
 *
 * Supports:
 * - Datacenter proxies (fast, cheap, easily detected)
 * - Residential proxies (slower, expensive, hard to detect)
 * - Geo-targeting (route through specific countries)
 */

export type ProxyType = "datacenter" | "residential" | "none";

export interface ProxyConfig {
  type: ProxyType;
  geo?: string; // ISO country code: "us", "gb", "de"
}

interface ProxyServer {
  server: string;
  username: string;
  password: string;
}

/**
 * Resolve proxy configuration to a Playwright-compatible proxy object.
 */
export function resolveProxy(config: ProxyConfig): ProxyServer | undefined {
  if (config.type === "none") return undefined;

  const isResidential = config.type === "residential";

  const baseUrl = isResidential
    ? process.env.PROXY_RESIDENTIAL_URL
    : process.env.PROXY_DATACENTER_URL;

  if (!baseUrl) {
    console.warn(`[proxy] No ${config.type} proxy URL configured, skipping`);
    return undefined;
  }

  try {
    const url = new URL(baseUrl);

    // Append geo-targeting to username if supported
    // Most proxy providers use format: user-country-us:password
    let username = url.username;
    if (config.geo) {
      username = `${username}-country-${config.geo}`;
    }

    return {
      server: `${url.protocol}//${url.hostname}:${url.port}`,
      username,
      password: url.password,
    };
  } catch (err) {
    console.error(`[proxy] Invalid proxy URL: ${baseUrl}`);
    return undefined;
  }
}

/**
 * Rotate proxy by requesting a new session from the provider.
 * Most residential proxy providers support session rotation
 * by changing the session ID in the username.
 */
export function rotateSession(proxy: ProxyServer): ProxyServer {
  const sessionId = Math.random().toString(36).slice(2, 10);
  const baseUsername = proxy.username.replace(/-session-\w+/, "");

  return {
    ...proxy,
    username: `${baseUsername}-session-${sessionId}`,
  };
}

/**
 * Get proxy cost estimate per GB for a given proxy type.
 */
export function getProxyCostPerGB(type: ProxyType): number {
  switch (type) {
    case "residential":
      return 10.0; // $10/GB
    case "datacenter":
      return 1.0; // $1/GB
    default:
      return 0;
  }
}
