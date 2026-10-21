import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";

const vercelHost =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_URL;
export const applicationURL = vercelHost
  ? `https://${vercelHost}`
  : process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: applicationURL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  user: {
    additionalFields: {
      kind: { type: "string", defaultValue: "CUSTOMER", input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  rateLimit: { enabled: true, window: 60, max: 60 },
});
