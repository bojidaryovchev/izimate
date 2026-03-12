import { verifyToken } from "@izimate/db/auth";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

const authPluginFn: FastifyPluginAsync = async (app) => {
  app.decorateRequest("userId", "");

  app.addHook("onRequest", async (req, reply) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.code(401).send({
        error: { code: "MISSING_TOKEN", message: "Missing or invalid authorization header", statusCode: 401 },
      });
    }

    const token = header.slice(7);
    try {
      const payload = await verifyToken(token);
      req.userId = payload.sub!;
    } catch {
      return reply.code(401).send({
        error: { code: "INVALID_TOKEN", message: "Invalid or expired token", statusCode: 401 },
      });
    }
  });
};

export const authPlugin = fp(authPluginFn, { name: "auth" });
