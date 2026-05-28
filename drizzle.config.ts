import { defineConfig } from "drizzle-kit";

import env from "./lib/env";

if (!env.DATABASE_URL)
  throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  casing: "snake_case",
  dbCredentials: { url: env.DATABASE_URL },
  verbose: true,
  strict: true,
  dialect: "sqlite",
});
