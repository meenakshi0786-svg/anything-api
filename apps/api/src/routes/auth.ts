import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { scrypt, randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { db } from "@afa/db";
import { users, apiKeys } from "@afa/db";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthContext } from "../middleware/auth.js";

const scryptAsync = promisify(scrypt);

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = "7d";

// OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const OAUTH_REDIRECT_BASE = process.env.PUBLIC_API_URL || process.env.CORS_ORIGIN || "http://localhost:3001";

// ─── Helpers ──────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  return timingSafeEqual(derived, storedBuf);
}

function signJwt(payload: { userId: string; email: string; plan: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// ─── Validation Schemas ───────────────────────────────────

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createApiKeySchema = z.object({
  name: z.string().min(1).max(200),
  scopes: z.array(z.string()).optional(),
  expiresInDays: z.number().int().positive().optional(),
});

// ─── Routes ───────────────────────────────────────────────

export const authRoutes: FastifyPluginAsync = async (app) => {
  // ── Signup ────────────────────────────────────────────
  app.post("/auth/signup", async (request, reply) => {
    const body = signupSchema.parse(request.body);

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existing) {
      return reply.status(409).send({
        error: {
          code: "EMAIL_EXISTS",
          message: "A user with this email already exists",
        },
      });
    }

    const passwordHash = await hashPassword(body.password);

    const [user] = await db
      .insert(users)
      .values({
        email: body.email,
        name: body.name,
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        plan: users.plan,
        createdAt: users.createdAt,
      });

    const token = signJwt({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    });

    return reply.status(201).send({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          createdAt: user.createdAt,
        },
      },
      meta: { requestId: request.id },
    });
  });

  // ── Login ─────────────────────────────────────────────
  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (!user || !user.passwordHash) {
      return reply.status(401).send({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);

    if (!valid) {
      return reply.status(401).send({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    });

    return reply.send({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          createdAt: user.createdAt,
        },
      },
      meta: { requestId: request.id },
    });
  });

  // ── Get current user ──────────────────────────────────
  app.get("/auth/me", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          plan: users.plan,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, auth.userId))
        .limit(1);

      if (!user) {
        return reply.status(404).send({
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }

      return reply.send({
        data: user,
        meta: { requestId: request.id },
      });
    },
  });

  // ── Create API key ────────────────────────────────────
  app.post("/auth/api-keys", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const body = createApiKeySchema.parse(request.body);

      // Generate key: afa_sk_live_ + 32 random hex chars
      const rawKey = `afa_sk_live_${randomBytes(16).toString("hex")}`;
      const keyHash = createHash("sha256").update(rawKey).digest("hex");
      const keyPrefix = rawKey.slice(0, 20); // "afa_sk_live_" + first 8 hex chars

      const expiresAt = body.expiresInDays
        ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const [apiKey] = await db
        .insert(apiKeys)
        .values({
          userId: auth.userId,
          name: body.name,
          keyHash,
          keyPrefix,
          scopes: body.scopes || ["*"],
          expiresAt,
        })
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          keyPrefix: apiKeys.keyPrefix,
          scopes: apiKeys.scopes,
          expiresAt: apiKeys.expiresAt,
          createdAt: apiKeys.createdAt,
        });

      // Return the full key ONCE — it cannot be retrieved again
      return reply.status(201).send({
        data: {
          ...apiKey,
          key: rawKey,
        },
        meta: {
          requestId: request.id,
          warning:
            "Store this key securely. It will not be shown again.",
        },
      });
    },
  });

  // ── List API keys ─────────────────────────────────────
  app.get("/auth/api-keys", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;

      const keys = await db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          keyPrefix: apiKeys.keyPrefix,
          scopes: apiKeys.scopes,
          lastUsedAt: apiKeys.lastUsedAt,
          expiresAt: apiKeys.expiresAt,
          createdAt: apiKeys.createdAt,
        })
        .from(apiKeys)
        .where(eq(apiKeys.userId, auth.userId));

      return reply.send({
        data: keys,
        meta: { requestId: request.id },
      });
    },
  });

  // ── Revoke API key ────────────────────────────────────
  app.delete("/auth/api-keys/:id", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const auth = (request as any).auth as AuthContext;
      const { id } = request.params as { id: string };

      const [deleted] = await db
        .delete(apiKeys)
        .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, auth.userId)))
        .returning({ id: apiKeys.id });

      if (!deleted) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "API key not found" },
        });
      }

      return reply.status(204).send();
    },
  });

  // ═══════════════════════════════════════════════════════
  // OAUTH — Google
  // ═══════════════════════════════════════════════════════

  // Step 1: Redirect to Google
  app.get("/auth/google", async (request, reply) => {
    if (!GOOGLE_CLIENT_ID) {
      return reply.status(501).send({
        error: { code: "OAUTH_NOT_CONFIGURED", message: "Google OAuth is not configured" },
      });
    }

    const redirectUri = `${OAUTH_REDIRECT_BASE}/v1/auth/google/callback`;
    const scope = encodeURIComponent("openid email profile");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    return reply.redirect(url);
  });

  // Step 2: Google callback
  app.get("/auth/google/callback", async (request, reply) => {
    const { code } = request.query as { code?: string };
    if (!code) {
      return reply.status(400).send({ error: { code: "MISSING_CODE", message: "No authorization code" } });
    }

    const redirectUri = `${OAUTH_REDIRECT_BASE}/v1/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return reply.status(400).send({ error: { code: "OAUTH_FAILED", message: "Google token exchange failed" } });
    }

    const tokens = await tokenRes.json();

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();

    // Find or create user
    const token = await findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      avatarUrl: profile.picture || null,
      provider: "google",
    });

    // Redirect to frontend with token
    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
    return reply.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  });

  // ═══════════════════════════════════════════════════════
  // OAUTH — GitHub
  // ═══════════════════════════════════════════════════════

  // Step 1: Redirect to GitHub
  app.get("/auth/github", async (request, reply) => {
    if (!GITHUB_CLIENT_ID) {
      return reply.status(501).send({
        error: { code: "OAUTH_NOT_CONFIGURED", message: "GitHub OAuth is not configured" },
      });
    }

    const redirectUri = `${OAUTH_REDIRECT_BASE}/v1/auth/github/callback`;
    const scope = encodeURIComponent("user:email");
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

    return reply.redirect(url);
  });

  // Step 2: GitHub callback
  app.get("/auth/github/callback", async (request, reply) => {
    const { code } = request.query as { code?: string };
    if (!code) {
      return reply.status(400).send({ error: { code: "MISSING_CODE", message: "No authorization code" } });
    }

    // Exchange code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return reply.status(400).send({ error: { code: "OAUTH_FAILED", message: "GitHub token exchange failed" } });
    }

    // Get user profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const profile = await userRes.json();

    // Get primary email (may be private)
    let email = profile.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/vnd.github+json",
        },
      });
      const emails = await emailRes.json();
      const primary = emails.find((e: any) => e.primary) || emails[0];
      email = primary?.email;
    }

    if (!email) {
      return reply.status(400).send({ error: { code: "NO_EMAIL", message: "Could not get email from GitHub" } });
    }

    const token = await findOrCreateOAuthUser({
      email,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url || null,
      provider: "github",
    });

    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
    return reply.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  });
};

// ─── OAuth helper ──────────────────────────────────────────

async function findOrCreateOAuthUser(profile: {
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: string;
}): Promise<string> {
  // Check if user exists
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, profile.email))
    .limit(1);

  if (!user) {
    // Create new user (no password — OAuth only)
    [user] = await db
      .insert(users)
      .values({
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      })
      .returning();
  } else {
    // Update avatar if missing
    if (!user.avatarUrl && profile.avatarUrl) {
      await db
        .update(users)
        .set({ avatarUrl: profile.avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }
  }

  return signJwt({
    userId: user.id,
    email: user.email,
    plan: user.plan,
  });
}
