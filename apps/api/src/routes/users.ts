import { eq, getDb, users } from "@izimate/db";
import type { FastifyPluginAsync } from "fastify";

export const usersRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/users/me — upsert current user on first login
  app.get("/me", async (req) => {
    const db = getDb(process.env.DATABASE_URL!);
    const auth0Id = req.userId;

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
    if (existing) {
      return existing;
    }

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
  });
};
