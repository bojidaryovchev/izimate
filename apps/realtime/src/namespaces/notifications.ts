import type { FastifyBaseLogger } from "fastify";
import type { Server } from "socket.io";

export function registerNotificationsNamespace(io: Server, log: FastifyBaseLogger) {
  const nsp = io.of("/notifications");

  nsp.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    log.info(`[/notifications] connected: ${socket.id} (user: ${userId})`);

    // Join user's personal notification room
    socket.join(`user:${userId}`);

    socket.on("notification:read", (data: { notificationId: string }) => {
      // Broadcast read status to all user's devices
      nsp.to(`user:${userId}`).emit("notification:read", data);
    });

    socket.on("disconnect", () => {
      log.info(`[/notifications] disconnected: ${socket.id} (user: ${userId})`);
    });
  });
}
