import { createAuth } from "~/lib/auth";
import { createDb } from "~/lib/db";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    const { env } = event.context.cloudflare;
    event.context.db = createDb(env.travel_log_database);
    event.context.auth = createAuth(event.context.db, env);
  });
});
