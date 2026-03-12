import { APP_NAME } from "@izimate/shared";
import Fastify from "fastify";
import { authPlugin } from "./middleware/auth.js";
import { usersRoutes } from "./routes/users.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok", app: APP_NAME };
  });

  // Protected routes — JWT auth required
  app.register(async (authedApp) => {
    await authedApp.register(authPlugin);
    await authedApp.register(usersRoutes, { prefix: "/api/users" });
  });

  return app;
}
