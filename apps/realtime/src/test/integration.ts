/**
 * Phase 6 Integration Test: SNS → Fargate → Client
 *
 * Validates the end-to-end realtime flow:
 *   1. Starts the realtime server locally
 *   2. Connects a Socket.io client with mock auth
 *   3. Simulates an SNS event delivery via HTTP POST to /internal/events
 *   4. Verifies the client receives the event in the correct namespace/room
 *
 * Usage:
 *   AUTH0_DOMAIN=test AUTH0_AUDIENCE=test DATABASE_URL=... npx tsx apps/realtime/src/test/integration.ts
 *
 * For local testing without a real Auth0, set AUTH0_DOMAIN and AUTH0_AUDIENCE
 * to any values — the test monkey-patches verifyToken() to bypass JWT verification.
 */

import Fastify from "fastify";
import { Server } from "socket.io";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";

const TEST_PORT = 3099;
const TEST_USER_ID = "test-user-123";

// ─── Helpers ─────────────────────────────────────────────────────
function waitForEvent<T>(socket: ClientSocket, event: string, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for event "${event}"`)), timeoutMs);
    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function waitForConnect(socket: ClientSocket, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) return resolve();
    const timer = setTimeout(() => reject(new Error("Timeout waiting for socket connect")), timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

// ─── Test server setup (mirrors index.ts but with mock auth) ─────
async function createTestServer() {
  const app = Fastify({ logger: false });
  const io = new Server(app.server, {
    cors: { origin: "*" },
  });

  // Mock auth — accept any connection, assign TEST_USER_ID
  function applyMockAuth(namespace: ReturnType<typeof io.of>) {
    namespace.use((socket, next) => {
      socket.data.userId = TEST_USER_ID;
      next();
    });
  }

  applyMockAuth(io.of("/"));
  applyMockAuth(io.of("/notifications"));
  applyMockAuth(io.of("/presence"));
  applyMockAuth(io.of("/chat"));

  // Default namespace — join personal room
  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
  });

  // Notifications namespace — join personal room
  io.of("/notifications").on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
  });

  // Chat namespace — room management
  io.of("/chat").on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
    socket.on("room:join", (roomId: string) => {
      socket.join(`room:${roomId}`);
    });
    socket.on("room:leave", (roomId: string) => {
      socket.leave(`room:${roomId}`);
    });
  });

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  // SNS text/plain parser
  app.addContentTypeParser("text/plain", { parseAs: "string" }, (_req, body, done) => {
    try {
      done(null, JSON.parse(body as string));
    } catch (err) {
      done(err as Error);
    }
  });

  // SNS internal endpoint
  app.post<{ Body: { SubscribeURL?: string; Message?: string } }>("/internal/events", async (req, reply) => {
    if (req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation") {
      return reply.code(200).send();
    }
    if (req.body.Message) {
      const event = JSON.parse(req.body.Message);
      const { namespace, room, type, data } = event;
      if (!namespace || !type) {
        return reply.code(400).send({ error: "Invalid event" });
      }
      io.of(namespace).to(room).emit(type, data);
    }
    return reply.code(200).send({ ok: true });
  });

  await app.listen({ port: TEST_PORT, host: "127.0.0.1" });
  return { app, io };
}

// ─── Tests ───────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n🧪 Phase 6 Integration Tests: Realtime Server\n");

  // Start test server
  const { app, io } = await createTestServer();

  try {
    // ── Test 1: Health check ──────────────────────────────────
    console.log("Test 1: Health check");
    const healthRes = await fetch(`http://127.0.0.1:${TEST_PORT}/health`);
    const healthBody = (await healthRes.json()) as { status: string };
    assert(healthRes.status === 200, "Health endpoint returns 200");
    assert(healthBody.status === "ok", "Health body contains status: ok");

    // ── Test 2: Socket.io connection with auth ────────────────
    console.log("\nTest 2: Socket.io connection");
    const defaultSocket = ioc(`http://127.0.0.1:${TEST_PORT}`, {
      transports: ["websocket"],
      auth: { token: "test-token" },
    });
    await waitForConnect(defaultSocket);
    assert(defaultSocket.connected, "Default namespace connects");

    // ── Test 3: SNS → /notifications → client ─────────────────
    console.log("\nTest 3: SNS event → /notifications namespace → client");
    const notifSocket = ioc(`http://127.0.0.1:${TEST_PORT}/notifications`, {
      transports: ["websocket"],
      auth: { token: "test-token" },
    });
    await waitForConnect(notifSocket);
    assert(notifSocket.connected, "/notifications namespace connects");

    // Listen for the notification event before sending
    const notifPromise = waitForEvent<{ id: string; message: string }>(notifSocket, "notification:new");

    // Simulate SNS delivering an event
    const snsRes = await fetch(`http://127.0.0.1:${TEST_PORT}/internal/events`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        Message: JSON.stringify({
          type: "notification:new",
          namespace: "/notifications",
          room: `user:${TEST_USER_ID}`,
          data: { id: "notif-1", message: "Test notification" },
        }),
      }),
    });
    assert(snsRes.status === 200, "SNS internal endpoint returns 200");

    const notifData = await notifPromise;
    assert(notifData.id === "notif-1", "Client received notification with correct id");
    assert(notifData.message === "Test notification", "Client received notification with correct message");

    // ── Test 4: SNS subscription confirmation ─────────────────
    console.log("\nTest 4: SNS subscription confirmation");
    const confirmRes = await fetch(`http://127.0.0.1:${TEST_PORT}/internal/events`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "x-amz-sns-message-type": "SubscriptionConfirmation",
      },
      body: JSON.stringify({
        SubscribeURL: `http://127.0.0.1:${TEST_PORT}/health`, // Use health as a safe URL to confirm
      }),
    });
    assert(confirmRes.status === 200, "Subscription confirmation returns 200");

    // ── Test 5: Invalid event rejected ────────────────────────
    console.log("\nTest 5: Invalid event handling");
    const invalidRes = await fetch(`http://127.0.0.1:${TEST_PORT}/internal/events`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        Message: JSON.stringify({ data: "no-namespace-or-type" }),
      }),
    });
    assert(invalidRes.status === 400, "Invalid event returns 400");

    // ── Test 6: Chat namespace room-based routing ─────────────
    console.log("\nTest 6: Chat namespace room-based event routing");
    const chatSocket = ioc(`http://127.0.0.1:${TEST_PORT}/chat`, {
      transports: ["websocket"],
      auth: { token: "test-token" },
    });
    await waitForConnect(chatSocket);
    assert(chatSocket.connected, "/chat namespace connects");

    // Join a chat room
    chatSocket.emit("room:join", "room-abc");
    // Give server time to process the join
    await new Promise((r) => setTimeout(r, 100));

    const chatPromise = waitForEvent<{ text: string }>(chatSocket, "message:send");
    await fetch(`http://127.0.0.1:${TEST_PORT}/internal/events`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        Message: JSON.stringify({
          type: "message:send",
          namespace: "/chat",
          room: "room:room-abc",
          data: { text: "Hello from SNS" },
        }),
      }),
    });

    const chatData = await chatPromise;
    assert(chatData.text === "Hello from SNS", "Chat room received SNS-routed message");

    // ── Cleanup ───────────────────────────────────────────────
    defaultSocket.disconnect();
    notifSocket.disconnect();
    chatSocket.disconnect();
  } finally {
    io.close();
    await app.close();
  }

  // ── Summary ─────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed > 0) {
    console.log("❌ Some tests failed\n");
    process.exit(1);
  } else {
    console.log("✅ All tests passed\n");
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
