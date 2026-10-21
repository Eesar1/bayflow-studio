import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Set DATABASE_URL_UNPOOLED or DATABASE_URL before running migrations.");
}

process.env.DATABASE_URL = databaseUrl;
const { db, sql } = await import("../src/db");

await migrate(db, { migrationsFolder: "./drizzle" });
await sql.end();
console.log("PostgreSQL migrations applied.");
