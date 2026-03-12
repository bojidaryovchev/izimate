import type { FastifyPluginAsync } from "fastify";

export const webhookRoutes: FastifyPluginAsync = async (app) => {
  // POST /webhooks/stripe — Stripe webhook with signature verification
  app.post("/stripe", {
    config: { rawBody: true },
    handler: async (req, reply) => {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return reply
          .code(400)
          .send({ error: { code: "MISSING_SIGNATURE", message: "Missing Stripe signature header", statusCode: 400 } });
      }

      // TODO: Verify signature with Stripe SDK and process events
      // const event = stripe.webhooks.constructEvent(req.rawBody, signature, WEBHOOK_SECRET);

      app.log.info("Stripe webhook received (stub)");
      return reply.code(200).send({ received: true });
    },
  });
};
