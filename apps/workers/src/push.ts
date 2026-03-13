import { eq, getDb, pushReceipts, pushTokens } from "@izimate/db";
import type { SQSHandler } from "aws-lambda";
import Expo, { type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo();
const DATABASE_URL = process.env.DATABASE_URL!;

interface PushJob {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const handler: SQSHandler = async (event) => {
  const db = getDb(DATABASE_URL);

  for (const record of event.Records) {
    const job: PushJob = JSON.parse(record.body);
    const { userId, title, body, data } = job;

    // 1. Look up all push tokens for this user
    const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));

    if (tokens.length === 0) {
      console.log(`No push tokens for user ${userId}, skipping`);
      continue;
    }

    // 2. Build messages (only valid Expo tokens)
    const messages: ExpoPushMessage[] = [];
    for (const { token } of tokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.warn(`Invalid Expo push token: ${token}, skipping`);
        continue;
      }
      messages.push({ to: token, title, body, data, sound: "default" });
    }

    if (messages.length === 0) continue;

    // 3. Send in chunks (~100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      const ticketChunk: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);

      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];
        const token = chunk[i].to as string;

        if (ticket.status === "ok") {
          // Store ticket ID for receipt checking later
          await db.insert(pushReceipts).values({
            ticketId: ticket.id,
            token,
          });
          console.log(`Push sent: ticket=${ticket.id} token=${token}`);
        } else {
          // Immediately purge tokens that are no longer valid
          const errorDetail = "details" in ticket ? ticket.details : undefined;
          if (errorDetail && "error" in errorDetail && errorDetail.error === "DeviceNotRegistered") {
            await db.delete(pushTokens).where(eq(pushTokens.token, token));
            console.log(`Purged invalid token: ${token}`);
          } else {
            console.error(`Push error for token ${token}:`, ticket);
          }
        }
      }
    }

    console.log(`Push batch done: userId=${userId} tokens=${tokens.length}`);
  }
};
