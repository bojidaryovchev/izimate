import { verifyToken } from "@izimate/db/auth";
import type { AppEvent } from "@izimate/shared";
import { createAdapter } from "@socket.io/redis-adapter";
import Fastify from "fastify";
import { createClient } from "redis";
import { Server } from "socket.io";

import { registerChatNamespace } from "./namespaces/chat.js";
import { registerNotificationsNamespace } from "./namespaces/notifications.js";
import { registerPresenceNamespace } from "./namespaces/presence.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const REDIS_URL = process.env.REDIS_URL;

const app = Fastify({ logger: true });
const io = new Server(app.server, {
  cors: {
    origin: ["https://izimate.com", "https://www.izimate.com", "http://localhost:3000", "http://localhost:8081"],
    credentials: true,
  },
});

// ─── Redis pub/sub adapter ───────────────────────────────────────
if (REDIS_URL) {
  try {
    const pubClient = createClient({ url: REDIS_URL });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    app.log.info("Redis pub/sub adapter connected");
  } catch (err) {
    app.log.error(err, "Failed to connect Redis adapter — running without pub/sub");
  }
}

// ─── JWT auth middleware (applies to all namespaces) ─────────────
function applyAuth(namespace: ReturnType<typeof io.of>) {
  namespace.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error("Missing authentication token"));
    try {
      const payload = await verifyToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid authentication token"));
    }
  });
}

// Apply auth to all namespaces
applyAuth(io.of("/"));
applyAuth(io.of("/presence"));
applyAuth(io.of("/notifications"));
applyAuth(io.of("/chat"));

// ─── Default namespace — personal room join ──────────────────────
io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  app.log.info(`Socket connected: ${socket.id} (user: ${userId})`);
  socket.join(`user:${userId}`);
  socket.on("disconnect", () => {
    app.log.info(`Socket disconnected: ${socket.id} (user: ${userId})`);
  });
});

// ─── Register namespaces ─────────────────────────────────────────
registerPresenceNamespace(io, app.log);
registerNotificationsNamespace(io, app.log);
registerChatNamespace(io, app.log);

// ─── Health check ────────────────────────────────────────────────
app.get("/health", async () => ({ status: "ok" }));

// ─── SNS internal endpoint ───────────────────────────────────────
// SNS sends Content-Type: text/plain — tell Fastify to parse as JSON
app.addContentTypeParser("text/plain", { parseAs: "string" }, (_req, body, done) => {
  try {
    done(null, JSON.parse(body as string));
  } catch (err) {
    done(err as Error);
  }
});

app.post<{ Body: { SubscribeURL?: string; Message?: string } }>("/internal/events", async (req, reply) => {
  try {
    // SNS subscription confirmation
    if (req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation") {
      if (req.body.SubscribeURL) {
        const res = await fetch(req.body.SubscribeURL);
        app.log.info({ status: res.status }, "SNS subscription confirmed");
      }
      return reply.code(200).send();
    }

    // Normal event delivery
    if (req.body.Message) {
      const event: AppEvent = JSON.parse(req.body.Message);
      const { namespace, room, type, data } = event;
      if (!namespace || !type) {
        app.log.warn({ event }, "Invalid event — missing namespace or type");
        return reply.code(400).send({ error: "Invalid event" });
      }
      io.of(namespace).to(room).emit(type, data);
      app.log.info({ namespace, room, type }, "Event forwarded to Socket.io");
    }
    return reply.code(200).send({ ok: true });
  } catch (err) {
    app.log.error(err, "Error processing SNS event");
    return reply.code(500).send({ error: "Internal error" });
  }
});

// ─── Start server ────────────────────────────────────────────────
// ─── Graceful shutdown ───────────────────────────────────────────
const shutdown = async () => {
  app.log.info("Shutting down...");
  io.close();
  await app.close();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Realtime server listening at ${address}`);
});
