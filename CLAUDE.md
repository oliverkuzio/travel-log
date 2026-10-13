# CLAUDE.md

Travel Log: a Nuxt 3 SSR app on Cloudflare Workers (D1 + R2) for logging visited locations, grouping visits into trips, and showing them on a MapLibre map. Installable PWA. See README.md for setup.

## Commands

- `pnpm dev`: dev server on :3000. D1, R2 and `.dev.vars` are provided by `nitro-cloudflare-dev`.
- `pnpm lint` / `pnpm lint:fix`: ESLint (antfu config) also handles formatting. There is no Prettier.
- `pnpm check`: `nuxi typecheck`.
- `pnpm build`: production build into `.output/`. `pnpm preview` builds and then runs `wrangler dev`.
- `pnpm db:generate`: create a migration after editing `lib/db/schema/*`. `pnpm db:migrate` applies it locally.
- There is no test suite. Verify changes by running the app. Use `pnpm preview` for anything involving the service worker.

## Layout

- `pages/`: file-based routes. Everything signed-in lives under `pages/dashboard/` (locations, trips, types). Each route has `index`, `add` and `[slug]/edit` pages.
- `stores/`: Pinia setup stores, one per entity, wrapping `useFetch` (see Conventions).
- `components/`: shared UI. App chrome is in `components/app/`, auto-imported with an `App` prefix (`AppNavbar`, `AppDock`, `AppPwaUpdate`).
- `composables/`, `utils/`: auto-imported on the client. Under `utils/`, the files `define-*-event-handler.ts`, `read-cover-image-body.ts` and `send-zod-error.ts` are server helpers.
- `server/api/`: Nitro routes named `<path>.<method>.ts`. `server/plugins/cloudflare.ts` sets `event.context.db` (Drizzle) and `event.context.auth` (Better Auth) on each request. `server/middleware/auth.ts` sets `event.context.user` and redirects signed-out `/dashboard` requests to `/`.
- `lib/db/schema/`: Drizzle tables, plus Zod insert schemas from `drizzle-zod` that both client and server use. `lib/db/queries/` holds the query functions; route handlers call these rather than querying inline. `lib/db/migrations/` is generated, so don't edit it by hand.
- `service-worker/sw.ts`: custom Workbox service worker (`@vite-pwa/nuxt`, `injectManifest` strategy). The PWA manifest is configured under `pwa` in `nuxt.config.ts`.

## Conventions

- **Lint rules to know**: kebab-case filenames, double quotes, semicolons, `type` instead of `interface`, sorted imports, and at most one attribute per line in multi-line Vue tags. `process.env` is banned (`node/no-process-env`). Read runtime env from `event.context.cloudflare.env`, and build-time env from `lib/env.ts`.
- **Server handlers** use `defineAuthenticatedEventHandler` (returns 401 without a user) or `defineAdminEventHandler` (returns 403 if not admin), from `utils/`. Scope every query by `event.context.user.id`. Validate request bodies with the Drizzle-derived Zod schemas and return validation failures with `sendZodError`. Throw `createError({ statusCode, statusMessage })`; the client shows `statusMessage`.
- **Mutations** of locations, trips, logs and photos go through `useOutboxStore().mutate()`, which sends them straight away when possible and queues them offline (see PWA notes). Other mutations (location types, imports) use `$csrfFetch` (from `useNuxtApp()`), never plain `$fetch`, because nuxt-csurf rejects POST/PUT/PATCH without the token.
- **Stores** use `useFetch(url, { key, lazy: true, immediate: false })` with fixed keys, and pages call `refresh*()` themselves. The "current" entity URLs are computed from `route.params`.
- **Images** are stored in R2 under keys prefixed with the user's id. They are served only through `/api/images/<key>`, which checks ownership. Cover images are sent as multipart: a JSON `data` field plus a `coverImage` file (`utils/cover-image-request-body.ts` on the client, `read-cover-image-body.ts` on the server). Resize on the client with `resizeImage` before uploading.
- **Deployment-specific values** (domain, D1 id, bucket, Sentry slugs) live only in `wrangler.jsonc` and are marked there. Derive hosts from `BETTER_AUTH_URL` rather than hard-coding the domain, so forks only edit that file.
- **Map styles** are `public/styles/{light,dark}.json`, served through `/api/styles/:theme`, which swaps in `MAPTILER_API_KEY`. Never put the key in client code.
- **Admin**: `user.role === "admin"`. Location types are admin-managed. On the client, use the `admin` route middleware and `authStore.isAdmin`.
- **Styling**: use daisyUI components and theme tokens (`base-100`, `primary`, and so on) rather than raw colours. The two themes are defined in `assets/css/main.css`, and dark is the default. Phones get `AppDock`; `md` and wider get the sidebar.
- Comments explain _why_, briefly. Keep that density.

## PWA notes

- The service worker only exists in production builds. Test it with `pnpm preview` and Chrome DevTools → Application.
- Navigations are network-first with a cached fallback, then fall back to the precached `/app-shell`. That page is `ssr: false` and is rendered by the server, not prerendered, because prerendering fails without the Cloudflare context. `/api/*` navigations bypass the service worker so that OAuth callbacks work.
- `registerType: "prompt"` means updates wait for the user to click Reload in `AppPwaUpdate`. Never add `skipWaiting()` or `clientsClaim()` unconditionally.
- Runtime cache names live in `lib/pwa-caches.ts`, which both `sw.ts` and the app import, so keep it free of browser and Nuxt imports. Anything per user goes in `USER_CACHES`; `signOut()` in `stores/auth.ts` deletes those caches. A new user-data API route has to be added to the `api` route regex in `sw.ts`, or it won't be available offline.
- Only status 200 responses are cached, so 401, 403 and 404 are never saved.
- Use `useOnline()` for connection state. It starts `true` and updates after hydration, to avoid hydration mismatches. Disable features that need the network when offline (see `place-search.vue`).
- The MapTiler key is origin-restricted, so tiles return 403 on unapproved origins such as `wrangler dev` on a random port.
- **Offline writes** (`stores/outbox.ts`, `lib/outbox.ts`, `lib/outbox-overlay.ts`):
  - `mutate()` sends the change directly if online and nothing is queued. Otherwise, or if the network fails, it stores the change in IndexedDB. Server errors such as validation still throw, so forms show them inline.
  - Creates get a temporary slug (`offline_…`) and id (≥ 2^52, so still a positive integer for forms). Pages navigate to them like real records. Once synced, `refs` maps them to the real values, the sync engine rewrites later queued requests, and `plugins/outbox.client.ts` swaps the URL.
  - Pass a `preview` shaped like the API response (or the changed fields). `fetchWithOutbox`, which the location and trip stores use as their `$fetch`, overlays queued changes on GET responses for `/api/locations…` and `/api/trips…`. A new GET route the pages read needs handling in `lib/outbox-overlay.ts`.
  - Sync runs in order on load, on `online`, on becoming visible and every minute. A 4xx marks the change failed and blocks anything that depends on it. A 401 stops sync until the user signs in. Users retry or discard on `/dashboard/sync`.
  - Every create endpoint must honour the `Idempotency-Key` header (`utils/get-idempotency-key.ts` plus a `client_id` column unique per user), returning the existing row on a repeat. PUTs are naturally idempotent, and a DELETE that 404s counts as synced.
  - Queued photos are shown via `/api/images/pending/<clientId>`, which the service worker serves from IndexedDB.
  - Pages served from cache can have a stale CSRF token. The outbox refetches one from `/api/csrf-token` after a 403.
- The PWA roadmap (installable app, offline reads, offline writes) is complete. Possible follow-ups: Background Sync on Android, and offline support for location types and imports.

## Workflow

- PRs target `main`. Branch per change, and use imperative commit subjects with the PR number appended by GitHub (e.g. "Add optional cover photo to trips (#134)").
- Husky runs `lint-staged` (ESLint `--fix`) on commit.
