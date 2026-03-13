import { eq, getDb, pushReceipts, pushTokens } from "@izimate/db";
import type { ScheduledHandler } from "aws-lambda";
import Expo from "expo-server-sdk";

const expo = new Expo();
const DATABASE_URL = process.env.DATABASE_URL!;

export const handler: ScheduledHandler = async () => {
  const db = getDb(DATABASE_URL);

  // 1. Pull unprocessed ticket IDs
  const pending = await db.select().from(pushReceipts).where(eq(pushReceipts.processed, false));

  if (pending.length === 0) {
    console.log("No pending push receipts");
    return;
  }

  console.log(`Checking ${pending.length} push receipts`);

  // 2. Build ticketId → token lookup
  const ticketTokenMap = new Map(pending.map((r) => [r.ticketId, r.token]));
  const ticketIds = [...ticketTokenMap.keys()];

  // 3. Fetch receipts from Expo in chunks
  const receiptChunks = expo.chunkPushNotificationReceiptIds(ticketIds);
  for (const chunk of receiptChunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const [ticketId, receipt] of Object.entries(receipts)) {
      if (receipt.status === "error") {
        const details = "details" in receipt ? receipt.details : undefined;
        if (details && "error" in details && details.error === "DeviceNotRegistered") {
          // Token is no longer valid — purge it
          const token = ticketTokenMap.get(ticketId);
          if (token) {
            await db.delete(pushTokens).where(eq(pushTokens.token, token));
            console.log(`Purged invalid token: ${token}`);
          }
        } else {
          console.error(`Push receipt error for ticket ${ticketId}:`, receipt);
        }
      }

      // 4. Mark as processed regardless of status
      await db.update(pushReceipts).set({ processed: true }).where(eq(pushReceipts.ticketId, ticketId));
    }
  }

  console.log(`Processed ${pending.length} push receipts`);
};
