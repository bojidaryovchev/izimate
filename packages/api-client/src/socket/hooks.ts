import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "./index.js";

/** Generic hook — returns a connected socket for any namespace. */
export function useSocket(namespace = "/"): Socket {
  const socketRef = useRef<Socket | null>(null);
  if (!socketRef.current) {
    socketRef.current = getSocket(namespace);
  }
  return socketRef.current;
}

// ─── Presence ────────────────────────────────────────────────────────────────

export interface PresenceEvent {
  userId: string;
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket("/presence");

    const handleSync = (data: { userIds: string[] }) => {
      setOnlineUsers(new Set(data.userIds));
    };

    const handleOnline = (data: PresenceEvent) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    };

    const handleOffline = (data: PresenceEvent) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    };

    socket.on("presence:sync", handleSync);
    socket.on("user:online", handleOnline);
    socket.on("user:offline", handleOffline);

    // Request the current online list now that listeners are attached.
    // Also re-request on reconnect so the list stays fresh.
    const requestSync = () => socket.emit("presence:get");
    if (socket.connected) requestSync();
    socket.on("connect", requestSync);

    return () => {
      socket.off("presence:sync", handleSync);
      socket.off("user:online", handleOnline);
      socket.off("user:offline", handleOffline);
      socket.off("connect", requestSync);
    };
  }, []);

  return { onlineUsers, isOnline: (userId: string) => onlineUsers.has(userId) };
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  [key: string]: unknown;
}

export function useNotifications(onNotification?: (notification: Notification) => void) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    const socket = getSocket("/notifications");
    socketRef.current = socket;

    const handleNew = (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      callbackRef.current?.(data);
    };

    const handleRead = (data: { notificationId: string }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== data.notificationId));
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:read", handleRead);

    return () => {
      socket.off("notification:new", handleNew);
      socket.off("notification:read", handleRead);
    };
  }, []);

  const markRead = (notificationId: string) => {
    socketRef.current?.emit("notification:read", { notificationId });
  };

  return { notifications, markRead };
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  userId: string;
  roomId: string;
  message: unknown;
}

export interface TypingEvent {
  userId: string;
  roomId: string;
}

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket("/chat");
    socketRef.current = socket;
    socket.emit("room:join", roomId);

    const handleMessage = (data: ChatMessage) => {
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleTypingStart = (data: TypingEvent) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    };

    const handleTypingStop = (data: TypingEvent) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    };

    const handleRead = () => {
      // Consumers can extend this
    };

    socket.on("message:send", handleMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("message:read", handleRead);

    return () => {
      socket.off("message:send", handleMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("message:read", handleRead);
      socket.emit("room:leave", roomId);
    };
  }, [roomId]);

  const sendMessage = (message: unknown) => {
    socketRef.current?.emit("message:send", { roomId, message });
  };

  const startTyping = () => {
    socketRef.current?.emit("typing:start", { roomId });
  };

  const stopTyping = () => {
    socketRef.current?.emit("typing:stop", { roomId });
  };

  const markRead = (messageId: string) => {
    socketRef.current?.emit("message:read", { roomId, messageId });
  };

  return { messages, typingUsers, sendMessage, startTyping, stopTyping, markRead };
}
