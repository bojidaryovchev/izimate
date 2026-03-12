import { eq, getDb, users } from "@izimate/db";
import { UpdateUserSchema, UserSchema } from "@izimate/shared";
import type { FastifyPluginAsync } from "fastify";

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
    handler: async (req, reply) => {
      const db = getDb(process.env.DATABASE_URL!);
      const auth0Id = req.userId;

      const body = req.body as Record<string, unknown>;
      const [updated] = await db
        .update(users)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(users.auth0Id, auth0Id))
        .returning();

      if (!updated) {
        return (reply as any).code(404).send();
      }

      return updated;
    },
  });
};
