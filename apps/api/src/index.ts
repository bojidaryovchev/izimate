import { DB_PLACEHOLDER } from "@izimate/db";
import { APP_NAME } from "@izimate/shared";
import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok", app: APP_NAME, db: DB_PLACEHOLDER };
  });

  return app;
}
