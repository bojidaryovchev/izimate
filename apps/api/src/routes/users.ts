import { eq, getDb, pushTokens, users } from "@izimate/db";
import { UpdateUserSchema, UserSchema } from "@izimate/shared";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const PushTokenBody = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

export const usersRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/users/me — return current user (upsert on first login)
  app.get("/me", {
    schema: { response: { 200: UserSchema } },
    handler: async (req) => {
      const db = getDb(process.env.DATABASE_URL!);
      const auth0Id = req.userId;

      const [existing] = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
      if (existing) return existing;

      // Upsert on first login — extract info from JWT claims
      const token = req.headers.authorization!.slice(7);
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());

      const [newUser] = await db
        .insert(users)
        .values({
          auth0Id,
          email: payload.email ?? `${auth0Id}@placeholder.local`,
          name: payload.name ?? payload.nickname ?? "User",
          avatarUrl: payload.picture ?? null,
        })
        .onConflictDoUpdate({
          target: users.auth0Id,
          set: {
            email: payload.email ?? `${auth0Id}@placeholder.local`,
            name: payload.name ?? payload.nickname ?? "User",
            avatarUrl: payload.picture ?? null,
            updatedAt: new Date(),
          },
        })
        .returning();

      return newUser;
    },
  });

  // PATCH /api/users/me — update current user profile
  app.patch("/me", {
    schema: {
      body: UpdateUserSchema,
      response: { 200: UserSchema },
    },
    handler: async (req) => {
      const db = getDb(process.env.DATABASE_URL!);
      const auth0Id = req.userId;

      const body = req.body as Record<string, unknown>;
      const [updated] = await db
        .update(users)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(users.auth0Id, auth0Id))
        .returning();

      if (!updated) {
        throw new HttpError(404, "User not found");
      }

      return updated;
    },
  });

  // POST /api/users/push-token — register/update a device push token
  app.post("/push-token", {
    schema: {
      body: PushTokenBody,
      response: { 200: z.object({ ok: z.boolean() }) },
    },
    handler: async (req) => {
      const db = getDb(process.env.DATABASE_URL!);
      const auth0Id = req.userId;

      // Resolve the internal user ID from auth0Id
      const [user] = await db.select({ id: users.id }).from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
      if (!user) throw new Error("User not found");

      const { token, platform } = req.body as z.infer<typeof PushTokenBody>;

      await db
        .insert(pushTokens)
        .values({ userId: user.id, token, platform })
        .onConflictDoUpdate({
          target: pushTokens.token,
          set: { userId: user.id, platform, updatedAt: new Date() },
        });

      return { ok: true };
    },
  });
};
