import { eq, getDb, users } from "@izimate/db";
import { publishEvent } from "@izimate/db/events";
import { queueEmail } from "@izimate/db/queue";
import type { FastifyPluginAsync } from "fastify";
import Stripe from "stripe";
import { z } from "zod";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const DATABASE_URL = process.env.DATABASE_URL!;

const stripe = new Stripe(STRIPE_SECRET_KEY);

const CheckoutBody = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const CheckoutResponse = z.object({
  url: z.string().url(),
});

const ConnectBody = z.object({
  returnUrl: z.string().url(),
  refreshUrl: z.string().url(),
});

// --- Authenticated payment routes (registered under /api/payments) ---
export const paymentsRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/payments/checkout — create a Stripe Checkout session
  app.post("/checkout", {
    schema: {
      body: CheckoutBody,
      response: { 200: CheckoutResponse },
    },
    handler: async (req) => {
      const { priceId, successUrl, cancelUrl } = req.body as z.infer<typeof CheckoutBody>;
      const db = getDb(DATABASE_URL);
      const auth0Id = req.userId;

      const [user] = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
      if (!user) {
        const err = new Error("User not found");
        (err as Error & { statusCode: number }).statusCode = 404;
        throw err;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId: user.id },
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session");
      }

      return { url: session.url };
    },
  });

  // POST /api/payments/connect — create a Stripe Connect onboarding link
  app.post("/connect", {
    schema: {
      body: ConnectBody,
    },
    handler: async (req) => {
      const { returnUrl, refreshUrl } = req.body as z.infer<typeof ConnectBody>;
      const db = getDb(DATABASE_URL);
      const auth0Id = req.userId;

      const [user] = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
      if (!user) {
        const err = new Error("User not found");
        (err as Error & { statusCode: number }).statusCode = 404;
        throw err;
      }

      // Create or retrieve connected account
      let accountId = user.stripeConnectId;

      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          email: user.email,
          metadata: { userId: user.id },
        });
        accountId = account.id;
        await db.update(users).set({ stripeConnectId: accountId, updatedAt: new Date() }).where(eq(users.id, user.id));
      }

      const link = await stripe.accountLinks.create({
        account: accountId,
        type: "account_onboarding",
        return_url: returnUrl,
        refresh_url: refreshUrl,
      });

      return { url: link.url };
    },
  });
};

// --- Stripe webhook handler (registered under /webhooks, NO auth) ---
export const stripeWebhookHandler: FastifyPluginAsync = async (app) => {
  app.post("/stripe", {
    config: { rawBody: true },
    handler: async (req, reply) => {
      const signature = req.headers["stripe-signature"];
      if (!signature || typeof signature !== "string") {
        return reply
          .code(400)
          .send({ error: { code: "MISSING_SIGNATURE", message: "Missing Stripe signature header", statusCode: 400 } });
      }

      let event: Stripe.Event;
      try {
        // rawBody is available via @fastify/raw-body or Fastify's native support
        const rawBody = (req as unknown as { rawBody: Buffer }).rawBody;
        event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid signature";
        return reply.code(400).send({ error: { code: "INVALID_SIGNATURE", message, statusCode: 400 } });
      }

      const db = getDb(DATABASE_URL);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          if (!userId) break;

          const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          if (!user) break;

          // Queue confirmation email
          await queueEmail(user.email, "notification", {
            subject: "Payment Confirmed",
            title: "Payment Confirmed",
            body: `Your payment of ${(session.amount_total ?? 0) / 100} ${session.currency?.toUpperCase()} has been processed.`,
          });

          // Publish realtime event
          await publishEvent({
            type: "payment:completed",
            namespace: "/notifications",
            room: userId,
            data: {
              sessionId: session.id,
              amount: session.amount_total,
              currency: session.currency,
            },
          });
          break;
        }

        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          const userId = account.metadata?.userId;
          if (!userId) break;

          await publishEvent({
            type: "connect:updated",
            namespace: "/notifications",
            room: userId,
            data: {
              accountId: account.id,
              chargesEnabled: account.charges_enabled,
              payoutsEnabled: account.payouts_enabled,
            },
          });
          break;
        }

        default:
          app.log.info(`Unhandled Stripe event: ${event.type}`);
      }

      return reply.code(200).send({ received: true });
    },
  });
};
