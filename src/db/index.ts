import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const globalDb = globalThis as unknown as { bayflowSql?: ReturnType<typeof postgres> };
export const sql =
  globalDb.bayflowSql ?? postgres(process.env.DATABASE_URL!, { max: 10, prepare: false });
if (process.env.NODE_ENV !== "production") globalDb.bayflowSql = sql;
export const db = drizzle(sql, { schema });
export type Tx = postgres.TransactionSql;
