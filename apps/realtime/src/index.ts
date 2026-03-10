import Fastify from "fastify";
import { Server } from "socket.io";

const app = Fastify({ logger: true });
const io = new Server(app.server, {
  cors: { origin: "*" },
});

app.get("/health", async () => {
  return { status: "ok" };
});

io.on("connection", (socket) => {
  app.log.info(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    app.log.info(`Socket disconnected: ${socket.id}`);
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
