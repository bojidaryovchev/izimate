import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema/users.js";

export const getDb = (url: string) => drizzle(neon(url), { schema });

export { schema };
export { users } from "./schema/users.js";
export { eq, and, or, desc, asc, sql, lte, gte, ne, isNull, isNotNull, inArray } from "drizzle-orm";
