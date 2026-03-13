import { eq, getDb, users } from "@izimate/db";
import type { FastifyBaseLogger } from "fastify";
import type { Server } from "socket.io";

const DATABASE_URL = process.env.DATABASE_URL;

export function registerPresenceNamespace(io: Server, log: FastifyBaseLogger) {
  const db = DATABASE_URL ? getDb(DATABASE_URL) : null;
  const nsp = io.of("/presence");

  async function setOnlineFlag(userId: string, isOnline: boolean) {
    if (!db) return;
    try {
      await db.update(users).set({ isOnline, updatedAt: new Date() }).where(eq(users.id, userId));
    } catch (err) {
      log.error(err, `[/presence] Failed to update is_online for user ${userId}`);
    }
  }

  nsp.on("connection", async (socket) => {
    const userId = socket.data.userId as string;
    log.info(`[/presence] connected: ${socket.id} (user: ${userId})`);

    // Join user's personal presence room
    socket.join(`user:${userId}`);

    // Mark user online in DB and broadcast to peers
    await setOnlineFlag(userId, true);
    socket.broadcast.emit("user:online", { userId });

    // Client requests the current online list after attaching its listeners
    socket.on("presence:get", async () => {
      const sockets = await nsp.fetchSockets();
      const onlineUserIds = [...new Set(sockets.map((s) => s.data.userId as string))];
      log.info(`[/presence] presence:get from ${socket.id} — online: [${onlineUserIds.join(", ")}]`);
      socket.emit("presence:sync", { userIds: onlineUserIds });
    });

    socket.on("disconnect", async () => {
      log.info(`[/presence] disconnected: ${socket.id} (user: ${userId})`);

      // Check if user has other active connections in this namespace
      const sockets = await nsp.in(`user:${userId}`).fetchSockets();
      if (sockets.length === 0) {
        await setOnlineFlag(userId, false);
        nsp.emit("user:offline", { userId });
      }
    });
  });
}
