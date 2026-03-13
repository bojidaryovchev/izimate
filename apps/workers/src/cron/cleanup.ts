import { getDb, lte, pushReceipts } from "@izimate/db";
import type { ScheduledHandler } from "aws-lambda";

const DATABASE_URL = process.env.DATABASE_URL!;

export const handler: ScheduledHandler = async () => {
  const db = getDb(DATABASE_URL);

  // Purge processed push receipts older than 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const deleted = await db
    .delete(pushReceipts)
    .where(lte(pushReceipts.createdAt, sevenDaysAgo))
    .returning({ id: pushReceipts.id });

  console.log(`Cleanup: purged ${deleted.length} old push receipts`);
};
