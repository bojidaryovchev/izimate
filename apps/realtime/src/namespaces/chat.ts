import type { FastifyBaseLogger } from "fastify";
import type { Server } from "socket.io";

export function registerChatNamespace(io: Server, log: FastifyBaseLogger) {
  const nsp = io.of("/chat");

  nsp.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    log.info(`[/chat] connected: ${socket.id} (user: ${userId})`);

    // Join user's personal room for direct messages
    socket.join(`user:${userId}`);

    // Join a chat room
    socket.on("room:join", (roomId: string) => {
      socket.join(`room:${roomId}`);
      log.info(`[/chat] user ${userId} joined room:${roomId}`);
    });

    // Leave a chat room
    socket.on("room:leave", (roomId: string) => {
      socket.leave(`room:${roomId}`);
      log.info(`[/chat] user ${userId} left room:${roomId}`);
    });

    // Typing indicators
    socket.on("typing:start", (data: { roomId: string }) => {
      socket.to(`room:${data.roomId}`).emit("typing:start", { userId, roomId: data.roomId });
    });

    socket.on("typing:stop", (data: { roomId: string }) => {
      socket.to(`room:${data.roomId}`).emit("typing:stop", { userId, roomId: data.roomId });
    });

    // Message send (relay to room — persistence handled by API)
    socket.on("message:send", (data: { roomId: string; message: unknown }) => {
      nsp.to(`room:${data.roomId}`).emit("message:send", {
        userId,
        roomId: data.roomId,
        message: data.message,
      });
    });

    // Message read receipt
    socket.on("message:read", (data: { roomId: string; messageId: string }) => {
      socket.to(`room:${data.roomId}`).emit("message:read", {
        userId,
        roomId: data.roomId,
        messageId: data.messageId,
      });
    });

    socket.on("disconnect", () => {
      log.info(`[/chat] disconnected: ${socket.id} (user: ${userId})`);
    });
  });
}
