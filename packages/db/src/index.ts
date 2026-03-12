import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema/users.js";

export const getDb = (url: string) => drizzle(neon(url), { schema });

export { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lte, ne, or, sql } from "drizzle-orm";
export { users } from "./schema/users.js";
export { schema };
