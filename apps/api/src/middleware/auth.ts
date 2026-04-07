import type { FastifyRequest, FastifyReply } from "fastify";
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { db } from "@afa/db";
import { apiKeys, users } from "@afa/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthContext {
  userId: string;
  teamId?: string;
  apiKeyId?: string;
  plan: string;
}

/**
 * Authenticate via API key (Authorization: Bearer afa_sk_...)
 * or JWT token for dashboard sessions.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    reply.status(401).send({
      error: { code: "UNAUTHORIZED", message: "Missing Authorization header" },
    });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  // API Key auth (starts with afa_sk_)
  if (token.startsWith("afa_sk_")) {
    const keyHash = createHash("sha256").update(token).digest("hex");

    const [key] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    if (!key) {
      reply.status(401).send({
        error: { code: "INVALID_API_KEY", message: "Invalid API key" },
      });
      return;
    }

    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      reply.status(401).send({
        error: { code: "EXPIRED_API_KEY", message: "API key has expired" },
      });
      return;
    }

    // Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, key.userId))
      .limit(1);

    if (!user) {
      reply.status(401).send({
        error: { code: "USER_NOT_FOUND", message: "User not found" },
      });
      return;
    }

    // Attach auth context
    (request as any).auth = {
      userId: user.id,
      teamId: key.teamId || undefined,
      apiKeyId: key.id,
      plan: user.plan,
    } satisfies AuthContext;

    // Update last used (fire and forget)
    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, key.id))
      .execute()
      .catch(() => {});

    return;
  }

  // JWT auth for dashboard sessions
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      plan: string;
    };

    // Attach auth context from JWT
    (request as any).auth = {
      userId: payload.userId,
      plan: payload.plan,
    } satisfies AuthContext;

    return;
  } catch {
    reply.status(401).send({
      error: { code: "INVALID_TOKEN", message: "Invalid or expired authentication token" },
    });
  }
}
