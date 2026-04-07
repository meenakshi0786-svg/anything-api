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
};
