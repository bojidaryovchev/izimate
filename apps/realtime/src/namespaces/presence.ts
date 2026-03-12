import type { FastifyBaseLogger } from "fastify";
import type { Server } from "socket.io";

export function registerPresenceNamespace(io: Server, log: FastifyBaseLogger) {
  const nsp = io.of("/presence");

  nsp.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    log.info(`[/presence] connected: ${socket.id} (user: ${userId})`);

    // Join user's personal presence room
    socket.join(`user:${userId}`);

    // Broadcast online status
    nsp.emit("user:online", { userId });

    socket.on("disconnect", async () => {
      log.info(`[/presence] disconnected: ${socket.id} (user: ${userId})`);

      // Check if user has other active connections in this namespace
      const sockets = await nsp.in(`user:${userId}`).fetchSockets();
      if (sockets.length === 0) {
        nsp.emit("user:offline", { userId });
      }
    });
  });
}
