import type { FastifyPluginAsync } from "fastify";
import { stripeWebhookHandler } from "./payments.js";

export const webhookRoutes: FastifyPluginAsync = async (app) => {
  await app.register(stripeWebhookHandler);
};
