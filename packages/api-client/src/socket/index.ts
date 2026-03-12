import { io, type Socket } from "socket.io-client";

export interface SocketConfig {
  url: string;
  getToken: () => Promise<string>;
}

let config: SocketConfig | null = null;

const sockets = new Map<string, Socket>();

export function configureSocket(cfg: SocketConfig) {
  config = cfg;
}

export function getSocket(namespace = "/"): Socket {
  if (!config) throw new Error("Socket not configured. Call configureSocket() first.");

  const key = namespace;
  const existing = sockets.get(key);
  if (existing) return existing;

  const socket = io(`${config.url}${namespace === "/" ? "" : namespace}`, {
    autoConnect: false,
    auth: async (cb) => {
      try {
        const token = await config!.getToken();
        cb({ token });
      } catch {
        cb({ token: "" });
      }
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });

  sockets.set(key, socket);
  return socket;
}

export function connectAll() {
  for (const socket of sockets.values()) {
    if (!socket.connected) socket.connect();
  }
}

export function disconnectAll() {
  for (const socket of sockets.values()) {
    socket.disconnect();
  }
  sockets.clear();
}
