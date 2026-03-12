import { verifyToken } from "@izimate/db/auth";
import Fastify from "fastify";
import { Server } from "socket.io";

const app = Fastify({ logger: true });
const io = new Server(app.server, {
  cors: { origin: "*" },
});

app.get("/health", async () => {
  return { status: "ok" };
});

// Socket.io auth middleware — verify JWT before connection
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    return next(new Error("Missing authentication token"));
  }
  try {
    const payload = await verifyToken(token);
    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  app.log.info(`Socket connected: ${socket.id} (user: ${userId})`);

  // Join user's personal room for targeted events
  socket.join(`user:${userId}`);

  socket.on("disconnect", () => {
    app.log.info(`Socket disconnected: ${socket.id} (user: ${userId})`);
  });
});

const PORT = parseInt(process.env.PORT || "3001", 10);

app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Realtime server listening at ${address}`);
});
