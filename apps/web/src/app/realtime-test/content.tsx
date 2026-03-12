"use client";

import { getSocket } from "@izimate/api-client/socket";
import { useChat, useNotifications, usePresence, useSocket } from "@izimate/api-client/socket/hooks";
import { useSocketReady } from "@/lib/socket-provider";
import { useCallback, useEffect, useRef, useState } from "react";

const ROOM_ID = "test-room";

const NAMESPACES = ["/", "/presence", "/notifications", "/chat"] as const;

function ConnectionStatus() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sockets = NAMESPACES.map((ns) => {
      try {
        return { ns, socket: getSocket(ns) };
      } catch {
        return null;
      }
    }).filter(Boolean) as { ns: string; socket: ReturnType<typeof getSocket> }[];

    const update = () => {
      const s: Record<string, boolean> = {};
      for (const { ns, socket } of sockets) {
        s[ns] = socket.connected;
      }
      setStatuses(s);
    };

    update();
    const interval = setInterval(update, 1000);

    for (const { socket } of sockets) {
      socket.on("connect", update);
      socket.on("disconnect", update);
    }

    return () => {
      clearInterval(interval);
      for (const { socket } of sockets) {
        socket.off("connect", update);
        socket.off("disconnect", update);
      }
    };
  }, []);

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-3 text-lg font-semibold">Connection Status</h2>
      <div className="flex flex-wrap gap-3">
        {NAMESPACES.map((ns) => (
          <div key={ns} className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${statuses[ns] ? "bg-green-500" : "bg-red-500"}`} />
            <span className="font-mono text-sm">{ns}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PresencePanel() {
  const { onlineUsers } = usePresence();

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-3 text-lg font-semibold">
        Presence <span className="text-sm font-normal text-zinc-500">({onlineUsers.size} online)</span>
      </h2>
      {onlineUsers.size === 0 ? (
        <p className="text-sm text-zinc-500">No users online yet</p>
      ) : (
        <ul className="space-y-1">
          {[...onlineUsers].map((userId) => (
            <li key={userId} className="flex items-center gap-2 text-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              <span className="font-mono text-xs">{userId}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChatPanel() {
  const { messages, typingUsers, sendMessage, startTyping, stopTyping } = useChat(ROOM_ID);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    startTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-3 text-lg font-semibold">
        Chat <span className="text-sm font-normal text-zinc-500">room: {ROOM_ID}</span>
      </h2>

      <div className="mb-3 h-48 overflow-y-auto rounded bg-zinc-50 p-3 dark:bg-zinc-900">
        {messages.length === 0 && <p className="text-sm text-zinc-500">No messages yet. Send one!</p>}
        {messages.map((msg, i) => (
          <div key={i} className="mb-1 text-sm">
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
              {String(msg.userId).slice(0, 8)}:
            </span>{" "}
            <span>{String(msg.message)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.size > 0 && (
        <p className="mb-2 text-xs text-zinc-500 italic">
          {[...typingUsers].map((u) => u.slice(0, 8)).join(", ")} typing...
        </p>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const { notifications, markRead } = useNotifications();

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-3 text-lg font-semibold">
        Notifications{" "}
        {notifications.length > 0 && (
          <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notifications.length}
          </span>
        )}
      </h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-zinc-500">No notifications. Publish an SNS event to test.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="flex items-center justify-between rounded bg-zinc-50 p-2 text-sm dark:bg-zinc-900"
            >
              <span className="font-mono text-xs">{JSON.stringify(n)}</span>
              <button onClick={() => markRead(n.id)} className="ml-2 text-xs text-blue-600 hover:underline">
                Mark read
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EventLog() {
  const [events, setEvents] = useState<string[]>([]);
  const socket = useSocket("/");

  const addEvent = useCallback((event: string) => {
    setEvents((prev) => [`${new Date().toLocaleTimeString()} — ${event}`, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const onConnect = () => addEvent("connected to /");
    const onDisconnect = (reason: string) => addEvent(`disconnected: ${reason}`);
    const onError = (err: Error) => addEvent(`error: ${err.message}`);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
    };
  }, [socket, addEvent]);

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-3 text-lg font-semibold">Event Log</h2>
      <div className="h-32 overflow-y-auto rounded bg-zinc-50 p-2 font-mono text-xs dark:bg-zinc-900">
        {events.length === 0 && <p className="text-zinc-500">Waiting for events...</p>}
        {events.map((e, i) => (
          <div key={i} className="text-zinc-600 dark:text-zinc-400">
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RealtimeTestContent() {
  const ready = useSocketReady();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">Connecting to realtime server&hellip;</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Realtime Test</h1>
          <p className="text-sm text-zinc-500">Open in two browser tabs to test presence + chat</p>
        </div>

        <ConnectionStatus />
        <PresencePanel />
        <ChatPanel />
        <NotificationsPanel />
        <EventLog />
      </div>
    </div>
  );
}
