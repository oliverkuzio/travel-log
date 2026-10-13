import * as Sentry from "@sentry/nuxt";

import { stripQueryStrings } from "./lib/sentry-scrub";

// The app holds users' travel history and photos, so send Sentry as little personal data as possible.
// Keep `PRIVACY.md` in sync with these settings.
Sentry.init({
  // If set up, you can use your runtime config here
  // dsn: useRuntimeConfig().public.sentry.dsn,
  dsn: import.meta.env.VITE_SENTRY_DSN,

  tracesSampleRate: 0.2,

  // Only record replays around errors, never whole sessions.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.25,

  integrations: [Sentry.replayIntegration({
    maskAllText: true,
    maskAllInputs: true,
    blockAllMedia: true,
  })],

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Don't attach IP addresses, cookies or request bodies to events.
  sendDefaultPii: false,

  beforeSend: stripQueryStrings,
  beforeSendTransaction: stripQueryStrings,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
