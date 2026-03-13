import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as pushReceiptsSchema from "./schema/push-receipts.js";
import * as pushTokensSchema from "./schema/push-tokens.js";
import * as usersSchema from "./schema/users.js";

const schema = { ...usersSchema, ...pushTokensSchema, ...pushReceiptsSchema };

export const getDb = (url: string) => drizzle(neon(url), { schema });

export { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lte, ne, or, sql } from "drizzle-orm";
export { pushReceipts } from "./schema/push-receipts.js";
export { pushTokens } from "./schema/push-tokens.js";
export { users } from "./schema/users.js";
export { schema };
