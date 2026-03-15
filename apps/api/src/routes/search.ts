import { getDb, sql, users } from "@izimate/db";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const DATABASE_URL = process.env.DATABASE_URL!;

const SearchQuery = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const SearchResultItem = z.object({
  id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  rank: z.number(),
});

const SearchResponse = z.object({
  results: z.array(SearchResultItem),
  total: z.number(),
  q: z.string(),
});

export const searchRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/search?q=...&limit=20&offset=0
  app.get("/", {
    schema: {
      querystring: SearchQuery,
      response: { 200: SearchResponse },
    },
    handler: async (req) => {
      const { q, limit, offset } = req.query as z.infer<typeof SearchQuery>;
      const db = getDb(DATABASE_URL);

      // Sanitize and build tsquery from user input
      const tsQuery = q
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => `${word}:*`)
        .join(" & ");

      // Full-text search across users (expandable to other entities)
      const results = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
          rank: sql<number>`ts_rank(
            to_tsvector('english', coalesce(${users.name}, '') || ' ' || coalesce(${users.email}, '')),
            to_tsquery('english', ${tsQuery})
          )`.as("rank"),
        })
        .from(users)
        .where(
          sql`to_tsvector('english', coalesce(${users.name}, '') || ' ' || coalesce(${users.email}, ''))
              @@ to_tsquery('english', ${tsQuery})`,
        )
        .orderBy(sql`rank DESC`)
        .limit(limit)
        .offset(offset);

      // Count total matches
      const [{ count }] = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(users)
        .where(
          sql`to_tsvector('english', coalesce(${users.name}, '') || ' ' || coalesce(${users.email}, ''))
              @@ to_tsquery('english', ${tsQuery})`,
        );

      return {
        results: results.map((r) => ({
          id: r.id,
          type: "user" as const,
          title: r.name,
          subtitle: r.email,
          avatarUrl: r.avatarUrl,
          rank: r.rank,
        })),
        total: count,
        q,
      };
    },
  });
};
