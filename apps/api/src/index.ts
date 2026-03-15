import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { APP_NAME } from "@izimate/shared";
import Fastify, { type FastifyError } from "fastify";
import rawBody from "fastify-raw-body";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { authPlugin } from "./middleware/auth.js";
import { paymentsRoutes } from "./routes/payments.js";
import { searchRoutes } from "./routes/search.js";
import { uploadsRoutes } from "./routes/uploads.js";
import { usersRoutes } from "./routes/users.js";
import { webhookRoutes } from "./routes/webhooks.js";

export async function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // --- Raw body for webhook signature verification ---
  await app.register(rawBody, { field: "rawBody", global: false, runFirst: true });

  // --- CORS ---
  await app.register(cors, { origin: ["https://izimate.com", /localhost/] });

  // --- Rate limiting ---
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // --- Standard error handler ---
  app.setErrorHandler((error: FastifyError, req, reply) => {
    // Zod validation errors → 400
    if (error.validation || error instanceof ZodError) {
      const zodErr = error instanceof ZodError ? error : (error as { cause?: ZodError }).cause;
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          statusCode: 400,
          details: zodErr instanceof ZodError ? zodErr.issues : error.validation,
        },
      });
    }

    // Rate limit → 429
    if (error.statusCode === 429) {
      return reply.code(429).send({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later",
          statusCode: 429,
        },
      });
    }

    // Known HTTP errors
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({
        error: {
          code: error.code ?? "REQUEST_ERROR",
          message: error.message,
          statusCode: error.statusCode,
        },
      });
    }

    // Unhandled → 500 (log full error, return generic message)
    req.log.error(error);
    return reply.code(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        statusCode: 500,
      },
    });
  });

  // --- Health check ---
  app.get("/health", async () => {
    return { status: "ok", app: APP_NAME };
  });

  // --- Webhooks — NO auth (uses signature verification) ---
  await app.register(webhookRoutes, { prefix: "/webhooks" });

  // --- All /api/* routes — JWT auth required ---
  await app.register(async (authedApp) => {
    await authedApp.register(authPlugin);
    await authedApp.register(usersRoutes, { prefix: "/api/users" });
    await authedApp.register(uploadsRoutes, { prefix: "/api/uploads" });
    await authedApp.register(paymentsRoutes, { prefix: "/api/payments" });
    await authedApp.register(searchRoutes, { prefix: "/api/search" });
  });

  return app;
}
