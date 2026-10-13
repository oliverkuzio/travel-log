import * as Sentry from "@sentry/nuxt";

import { stripQueryStrings } from "./lib/sentry-scrub";

// See `sentry.client.config.ts`: send as little personal data as possible, and keep `PRIVACY.md` in sync.
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  tracesSampleRate: 0.2,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Don't attach IP addresses, cookies or request bodies to events.
  sendDefaultPii: false,

  beforeSend: stripQueryStrings,
  beforeSendTransaction: stripQueryStrings,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
