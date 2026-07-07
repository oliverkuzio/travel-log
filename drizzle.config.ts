import { defineConfig } from "drizzle-kit";

// eslint-disable-next-line node/no-process-env
const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN } = process.env;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_DATABASE_ID || !CLOUDFLARE_D1_TOKEN) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID and CLOUDFLARE_D1_TOKEN must be set for drizzle-kit.");
}

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  casing: "snake_case",
  driver: "d1-http",
  dialect: "sqlite",
  dbCredentials: {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    databaseId: CLOUDFLARE_DATABASE_ID,
    token: CLOUDFLARE_D1_TOKEN,
  },
  verbose: true,
  strict: true,
});
