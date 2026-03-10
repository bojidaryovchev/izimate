# iZimate v2 — Implementation Patterns

> **Reference companion to [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)**
> This document contains the concrete code patterns and examples for building features on top of the iZimate v2 architecture. The system design describes _what_ and _why_; this document shows _how_.

---

## Table of Contents

1. [Auth — JWT Verification](#1-auth--jwt-verification)
2. [API Server — Fastify Bootstrap](#2-api-server--fastify-bootstrap)
3. [API Server — Route with Zod Validation](#3-api-server--route-with-zod-validation)
4. [API Server — Type-Safe Client](#4-api-server--type-safe-client)
5. [Realtime — SNS Event Subscription](#5-realtime--sns-event-subscription)
6. [Realtime — Publishing Events](#6-realtime--publishing-events)
7. [Realtime — Redis Pub/Sub Adapter](#7-realtime--redis-pubsub-adapter)
8. [Database — Drizzle Schema & Migrations](#8-database--drizzle-schema--migrations)
9. [Background Jobs — SQS Queue Helpers](#9-background-jobs--sqs-queue-helpers)
10. [Background Jobs — Cron Job Pattern](#10-background-jobs--cron-job-pattern)
11. [Push Notifications — Client Registration](#11-push-notifications--client-registration)
12. [Push Notifications — Token & Receipt Schemas](#12-push-notifications--token--receipt-schemas)
13. [Push Notifications — API Endpoint](#13-push-notifications--api-endpoint)
14. [Push Notifications — Worker (SQS Consumer)](#14-push-notifications--worker-sqs-consumer)
15. [Push Notifications — Receipt Checking Cron](#15-push-notifications--receipt-checking-cron)
16. [Search — Postgres Full-Text Search](#16-search--postgres-full-text-search)

---

## 1. Auth — JWT Verification

Shared `verifyToken()` used by all server-side services (API Lambda, Fargate, workers). Lives in `@izimate/db` because `jose` is server-only.

```typescript
// packages/db/src/auth.ts (server-side only — avoids bundling jose in clients)
import { jwtVerify, createRemoteJWKSet } from "jose";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;

const JWKS = createRemoteJWKSet(new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`));

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${AUTH0_DOMAIN}/`,
    audience: AUTH0_AUDIENCE,
  });
  return payload;
}
```

---

## 2. API Server — Fastify Bootstrap

Single Fastify app with Zod type provider, exported as Lambda handler. Webhooks are unauthenticated (signature-verified); all `/api/*` routes go through JWT auth.

```typescript
// apps/api/src/index.ts
import Fastify from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";
import cors from "@fastify/cors";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { authPlugin } from "./middleware/auth";
import { usersRoutes } from "./routes/users";
import { uploadsRoutes } from "./routes/uploads";
import { webhookRoute } from "./routes/webhooks";
// ... domain route modules

const app = Fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(cors, { origin: ["https://izimate.com", /localhost/] });

// Webhooks — NO auth (uses signature verification)
await app.register(webhookRoute, { prefix: "/webhooks" });

// All /api/* routes — JWT auth required
await app.register(async (authedApp) => {
  await authedApp.register(authPlugin);
  await authedApp.register(usersRoutes, { prefix: "/api/users" });
  await authedApp.register(uploadsRoutes, { prefix: "/api/uploads" });
  // ... domain routes registered here with /api/ prefix
});

await app.ready();
export const handler = awsLambdaFastify(app);
```

---

## 3. API Server — Route with Zod Validation

Each route module uses Zod schemas (from `@izimate/shared`) for request/response validation with automatic TypeScript inference.

```typescript
// apps/api/src/routes/resources.ts
import { z } from "zod";
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ResourceSchema, CreateResourceSchema } from "@izimate/shared";
import { db, resources } from "@izimate/db";

export const resourcesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/", {
    schema: {
      querystring: z.object({
        status: z.string().optional(),
        limit: z.coerce.number().default(20),
        offset: z.coerce.number().default(0),
      }),
      response: { 200: z.array(ResourceSchema) },
    },
    handler: async (req) => {
      // req.query is fully typed: { status?: string, limit: number, ... }
      return db.select().from(resources).where(/* ... */);
    },
  });

  app.post("/", {
    schema: {
      body: CreateResourceSchema, // Zod schema from @izimate/shared
      response: { 201: ResourceSchema },
    },
    handler: async (req, reply) => {
      // req.body is fully typed and validated before handler runs
      const [resource] = await db.insert(resources).values(req.body).returning();
      return reply.code(201).send(resource);
    },
  });
};
```

---

## 4. API Server — Type-Safe Client

Typed fetch wrappers in `@izimate/api-client` use the same Zod schemas, creating end-to-end type safety without code generation.

```typescript
// packages/api-client/src/http/resources.ts
import { z } from "zod";
import { ResourceSchema, CreateResourceSchema } from "@izimate/shared";
import { apiClient } from "./client";

type Resource = z.infer<typeof ResourceSchema>;

export const resourcesApi = {
  list: (params?: { status?: string }) => apiClient.get<Resource[]>("/api/resources", { params }),

  get: (id: string) => apiClient.get<Resource>(`/api/resources/${id}`),

  create: (data: z.infer<typeof CreateResourceSchema>) => apiClient.post<Resource>("/api/resources", data),
};

// Usage in mobile/web — typed via shared Zod schemas:
const { data } = useQuery({ queryKey: ["resources"], queryFn: () => resourcesApi.list() });
//      ^? Resource[]
```

---

## 5. Realtime — SNS Event Subscription

Fargate exposes `POST /internal/events` to receive SNS HTTPS deliveries. Handles both subscription confirmation and normal event forwarding to Socket.io rooms.

```typescript
// apps/realtime/src/internal/events.ts

// SNS sends Content-Type: text/plain — tell Fastify to parse it as JSON
app.addContentTypeParser("text/plain", { parseAs: "string" }, (req, body, done) => {
  try {
    done(null, JSON.parse(body as string));
  } catch (err) {
    done(err as Error);
  }
});

app.post("/internal/events", async (req, reply) => {
  // SNS sends subscription confirmation on first setup
  if (req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation") {
    await fetch(req.body.SubscribeURL); // Confirm subscription
    return reply.code(200).send();
  }

  // Normal event delivery
  const event = JSON.parse(req.body.Message);
  const { namespace, room, type, data } = event;
  io.of(namespace).to(room).emit(type, data);
  return reply.code(200).send({ ok: true });
});
```

---

## 6. Realtime — Publishing Events

Any Lambda (API, cron, worker) publishes events via SNS. The `publishEvent()` helper lives in `@izimate/db` (server-side only).

```typescript
// packages/db/src/events.ts (server-side only — uses AWS SDK)
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import type { AppEvent } from "@izimate/shared";

const sns = new SNSClient({});

export async function publishEvent(event: AppEvent) {
  await sns.send(
    new PublishCommand({
      TopicArn: process.env.EVENTS_TOPIC_ARN,
      Message: JSON.stringify(event),
      MessageAttributes: {
        eventType: { DataType: "String", StringValue: event.type },
      },
    }),
  );
}

// Usage:
await publishEvent({
  type: "entity:updated",
  namespace: "/notifications",
  room: entity.ownerId,
  data: entity,
});
```

---

## 7. Realtime — Redis Pub/Sub Adapter

Socket.io Redis adapter for cross-instance message broadcast. ElastiCache Redis in the same VPC.

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await pubClient.connect();
await subClient.connect();
io.adapter(createAdapter(pubClient, subClient));
```

---

## 8. Database — Drizzle Schema & Migrations

Drizzle schema is the single source of truth for database structure. Types are inferred — no separate type definitions needed.

```typescript
// packages/db/src/schema/users.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  auth0Id: text("auth0_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

Type inference:

```typescript
import { users } from "@izimate/db";
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

Migration workflow:

```bash
# Generate migration from schema changes
pnpm --filter @izimate/db drizzle-kit generate

# Push to Neon (dev)
pnpm --filter @izimate/db drizzle-kit push

# Apply migrations (production)
pnpm --filter @izimate/db drizzle-kit migrate
```

---

## 9. Background Jobs — SQS Queue Helpers

Server-side helpers that send messages directly to SQS queues. Used by API Lambda, cron, and Fargate.

```typescript
// packages/db/src/queue.ts (server-side — used by API Lambda + workers + cron)
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({});

export async function queueEmail(to: string, template: string, data: Record<string, unknown>) {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.EMAIL_QUEUE_URL,
      MessageBody: JSON.stringify({ to, template, data }),
    }),
  );
}

export async function queuePush(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>, // Deep linking payload
) {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.PUSH_QUEUE_URL,
      MessageBody: JSON.stringify({ userId, title, body, data }),
    }),
  );
}
```

---

## 10. Background Jobs — Cron Job Pattern

Standard pattern for any EventBridge-triggered scheduled job: query DB → update state → queue side-effects → publish realtime events.

```typescript
// apps/workers/src/cron/example.ts (pattern for any scheduled job)
import { db, someTable, users, eq, lte, and } from "@izimate/db";
import { queueEmail, queuePush } from "@izimate/db/queue";
import { publishEvent } from "@izimate/db/events";
import type { ScheduledHandler } from "aws-lambda";

export const handler: ScheduledHandler = async () => {
  // 1. Query for records matching time-based conditions
  const expired = await db
    .select()
    .from(someTable)
    .where(and(eq(someTable.status, "active"), lte(someTable.expiresAt, new Date())));

  for (const record of expired) {
    // 2. Update DB state
    await db.update(someTable).set({ status: "closed" }).where(eq(someTable.id, record.id));

    // 3. Notify affected user
    const [owner] = await db.select().from(users).where(eq(users.id, record.ownerId));
    await queueEmail(owner.email, "status-changed", { record });
    await queuePush(record.ownerId, "Status Update", "Your item status has changed");

    // 4. Push realtime event to connected clients
    await publishEvent({
      type: "record:updated",
      namespace: "/notifications",
      room: record.ownerId,
      data: { recordId: record.id },
    });
  }
};
```

---

## 11. Push Notifications — Client Registration

Expo app requests push permissions, gets an Expo Push Token, and sends it to our API for storage.

```typescript
// apps/mobile/src/lib/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { usersApi } from "@izimate/api-client";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) return null; // Push doesn't work on simulators

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  // Send token to our API — upsert in DB
  await usersApi.registerPushToken(token, Platform.OS as "ios" | "android");

  return token;
}
```

---

## 12. Push Notifications — Token & Receipt Schemas

Push tokens (one per device) and receipt tracking (for async delivery verification).

```typescript
// packages/db/src/schema/push-tokens.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const pushTokens = pgTable("push_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(), // ExponentPushToken[xxx]
  platform: text("platform").notNull(), // 'ios' | 'android'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

```typescript
// packages/db/src/schema/push-receipts.ts
import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const pushReceipts = pgTable("push_receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: text("ticket_id").notNull().unique(),
  token: text("token").notNull(), // Expo push token (for cleanup on failure)
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 13. Push Notifications — API Endpoint

Upsert push token endpoint. `authPlugin` decorates `req` with `req.userId` from the verified JWT.

```typescript
// apps/api/src/routes/users.ts (inside usersRoutes)
// Note: authPlugin decorates req with req.userId from the verified JWT
app.post("/push-token", {
  schema: {
    body: z.object({
      token: z.string().startsWith("ExponentPushToken["),
      platform: z.enum(["ios", "android"]),
    }),
  },
  handler: async (req) => {
    await db
      .insert(pushTokens)
      .values({ userId: req.userId, token: req.body.token, platform: req.body.platform })
      .onConflictDoUpdate({ target: pushTokens.token, set: { updatedAt: new Date() } });
    return { ok: true };
  },
});
```

---

## 14. Push Notifications — Worker (SQS Consumer)

Looks up all push tokens for a user, batches them via Expo SDK, stores ticket IDs for receipt checking, and immediately purges invalid tokens.

```typescript
// apps/workers/src/push.ts
import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { db, pushTokens, pushReceipts, eq } from "@izimate/db";
import type { SQSHandler } from "aws-lambda";

const expo = new Expo();

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const { userId, title, body, data } = JSON.parse(record.body);

    // 1. Look up all push tokens for this user
    const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));

    if (tokens.length === 0) continue;

    // 2. Build messages (one per device token)
    const messages: ExpoPushMessage[] = tokens
      .filter((t) => Expo.isExpoPushToken(t.token))
      .map((t) => ({
        to: t.token,
        sound: "default",
        title,
        body,
        data, // Custom payload — used for deep linking on tap
      }));

    if (messages.length === 0) continue;

    // 3. Send in chunks (Expo recommends batches of ~100)
    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);

      // 4. Store ticket IDs for receipt checking (cron job checks ~15min later)
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === "ok") {
          await db.insert(pushReceipts).values({ ticketId: ticket.id, token: chunk[i].to as string });
        } else if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
          // Token is invalid — remove from DB immediately
          await db.delete(pushTokens).where(eq(pushTokens.token, chunk[i].to as string));
        }
      }
    }
  }
};
```

---

## 15. Push Notifications — Receipt Checking Cron

Runs every 15 minutes via EventBridge. Checks Expo push receipts and purges tokens that are no longer valid.

```typescript
// apps/workers/src/cron/push-receipts.ts (EventBridge: rate(15 minutes))
import { Expo } from "expo-server-sdk";
import { db, pushTokens, pushReceipts, eq } from "@izimate/db";

const expo = new Expo();

export const handler = async () => {
  // Pull unprocessed ticket IDs stored when the push worker sent notifications
  const pending = await db.select().from(pushReceipts).where(eq(pushReceipts.processed, false));

  const ticketIds = pending.map((r) => r.ticketId);
  if (ticketIds.length === 0) return;

  const chunks = expo.chunkPushNotificationReceiptIds(ticketIds);

  for (const chunk of chunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const [ticketId, receipt] of Object.entries(receipts)) {
      if (receipt.status === "error" && receipt.details?.error === "DeviceNotRegistered") {
        // Token expired or user uninstalled — purge from DB
        const row = pending.find((r) => r.ticketId === ticketId);
        if (row) await db.delete(pushTokens).where(eq(pushTokens.token, row.token));
      }
      await db.update(pushReceipts).set({ processed: true }).where(eq(pushReceipts.ticketId, ticketId));
    }
  }
};
```

---

## 16. Search — Postgres Full-Text Search

Drizzle query using Postgres `tsvector` / `tsquery` for full-text search.

```typescript
// Drizzle query with Postgres tsvector
import { sql } from "drizzle-orm";
import { db, items } from "@izimate/db";

const tsVector = sql`to_tsvector('english', ${items.title} || ' ' || ${items.description})`;
const tsQuery = sql`plainto_tsquery('english', ${searchQuery})`;

const results = await db
  .select()
  .from(items)
  .where(sql`${tsVector} @@ ${tsQuery}`)
  .orderBy(sql`ts_rank(${tsVector}, ${tsQuery}) DESC`)
  .limit(20);
```
