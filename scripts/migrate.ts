import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sql } from "../src/db";

await migrate(db, { migrationsFolder: "./drizzle" });
await sql.end();
console.log("PostgreSQL migrations applied.");
