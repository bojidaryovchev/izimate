import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pushReceipts = pgTable("push_receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: text("ticket_id").notNull().unique(),
  token: text("token").notNull(),
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
