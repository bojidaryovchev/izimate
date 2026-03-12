import { getSocket } from "@izimate/api-client/socket";
import { useChat, useNotifications, usePresence, useSocket } from "@izimate/api-client/socket/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/auth";

const ROOM_ID = "test-room";

function ConnectionStatus() {
  const namespaces = ["/", "/presence", "/notifications", "/chat"];
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sockets = namespaces
      .map((ns) => {
        try {
          return { ns, socket: getSocket(ns) };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as { ns: string; socket: ReturnType<typeof getSocket> }[];

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
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Connection Status</Text>
      <View style={styles.row}>
        {namespaces.map((ns) => (
          <View key={ns} style={styles.statusItem}>
            <View style={[styles.dot, { backgroundColor: statuses[ns] ? "#22c55e" : "#ef4444" }]} />
            <Text style={styles.mono}>{ns}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PresencePanel() {
  const { onlineUsers } = usePresence();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Presence ({onlineUsers.size} online)</Text>
      {onlineUsers.size === 0 ? (
        <Text style={styles.muted}>No users online yet</Text>
      ) : (
        [...onlineUsers].map((userId) => (
          <View key={userId} style={styles.statusItem}>
            <View style={[styles.dot, { backgroundColor: "#22c55e" }]} />
            <Text style={styles.mono}>{userId}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function ChatPanel() {
  const { messages, typingUsers, sendMessage, startTyping, stopTyping } = useChat(ROOM_ID);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
    stopTyping();
  };

  const handleChangeText = (text: string) => {
    setInput(text);
    startTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 2000);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Chat (room: {ROOM_ID})</Text>

      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        nestedScrollEnabled
      >
        {messages.length === 0 ? (
          <Text style={styles.muted}>No messages yet. Send one!</Text>
        ) : (
          messages.map((item, i) => (
            <Text key={i} style={styles.messageItem}>
              <Text style={styles.messageUser}>{String(item.userId).slice(0, 8)}: </Text>
              {String(item.message)}
            </Text>
          ))
        )}
      </ScrollView>

      {typingUsers.size > 0 && (
        <Text style={styles.typingText}>{[...typingUsers].map((u) => u.slice(0, 8)).join(", ")} typing...</Text>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NotificationsPanel() {
  const { notifications, markRead } = useNotifications();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </View>
      {notifications.length === 0 ? (
        <Text style={styles.muted}>No notifications. Publish an SNS event to test.</Text>
      ) : (
        notifications.map((n) => (
          <View key={n.id} style={styles.notifItem}>
            <Text style={[styles.mono, { flex: 1 }]} numberOfLines={1}>
              {JSON.stringify(n)}
            </Text>
            <Pressable onPress={() => markRead(n.id)}>
              <Text style={styles.linkText}>Mark read</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
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
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Event Log</Text>
      <View style={styles.logBox}>
        {events.length === 0 ? (
          <Text style={styles.muted}>Waiting for events...</Text>
        ) : (
          events.map((e, i) => (
            <Text key={i} style={styles.logItem}>
              {e}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

export default function RealtimeTestScreen() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Log in to use realtime features</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Realtime Test</Text>
        <Text style={styles.subtitle}>Open on two devices to test presence + chat</Text>

        <ConnectionStatus />
        <PresencePanel />
        <ChatPanel />
        <NotificationsPanel />
        <EventLog />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold" },
  subtitle: { fontSize: 13, opacity: 0.5, marginBottom: 4 },
  card: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    padding: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" },
  statusItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  mono: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 11 },
  muted: { fontSize: 13, opacity: 0.5 },
  messageList: {
    height: 160,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  messageItem: { fontSize: 13, marginBottom: 4 },
  messageUser: { color: "#3b82f6", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 11 },
  typingText: { fontSize: 11, fontStyle: "italic", opacity: 0.5, marginBottom: 6 },
  inputRow: { flexDirection: "row", gap: 8 },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 8,
  },
  linkText: { color: "#3b82f6", fontSize: 12 },
  logBox: { height: 100, borderRadius: 8, padding: 8 },
  logItem: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 10, opacity: 0.6, marginBottom: 2 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
