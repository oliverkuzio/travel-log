# Travel Log | Kuzio Apps

Keep track of your travels: log the places you visit, group visits into trips, attach photos and see it all on a map.

Live at [travel.kuzio.app](https://travel.kuzio.app). Built with [Nuxt 3](https://nuxt.com/docs/getting-started/introduction), deployed to Cloudflare Workers with D1 (SQLite) and R2 (object storage), and installable as a progressive web app.

## Stack

| Area       | Tech                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| Framework  | Nuxt 3 (SSR) on the Nitro `cloudflare_module` preset                                        |
| Data       | Cloudflare D1 via [Drizzle ORM](https://orm.drizzle.team/), photos in Cloudflare R2         |
| Auth       | [Better Auth](https://www.better-auth.com/) with GitHub OAuth, CSRF via `nuxt-csurf`        |
| UI         | Tailwind CSS 4 + daisyUI 5, Tabler icons via `@nuxt/icon`, Pinia stores                     |
| Forms      | vee-validate + Zod (schemas derived from the Drizzle tables with `drizzle-zod`)             |
| Maps       | MapLibre GL (`nuxt-maplibre`) with MapTiler tiles, place search via OpenStreetMap Nominatim |
| PWA        | `@vite-pwa/nuxt` with a custom Workbox service worker                                       |
| Monitoring | Sentry (`@sentry/nuxt`)                                                                     |

## Prerequisites

- [Node.js](https://nodejs.org/) 24, pinned in `.node-version` (CI reads the same file). A version manager such as [fnm](https://github.com/Schniz/fnm) (`eval "$(fnm env --use-on-cd)"` in `~/.zshrc`) switches to it automatically when you `cd` into the repo. On Apple silicon, make sure it's an **arm64** build (`node -p process.arch`): the native bindings that get installed must match the Node architecture.
- [pnpm](https://pnpm.io/) 10 (pinned via `packageManager`; `corepack enable` will pick it up)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) with Workers, D1 and R2 enabled
- A [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for sign-in (use a separate one for local development)
- A [MapTiler](https://www.maptiler.com/) API key for the map tiles

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build-time environment (`.env`)

```bash
cp .env.example .env
```

| Variable                 | Description                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `NODE_ENV`               | `development` locally (validated in `lib/env.ts`)                                                      |
| `CLOUDFLARE_ACCOUNT_ID`  | Cloudflare account ID — only needed for `drizzle-kit` (`db:push`, `db:studio`)                         |
| `CLOUDFLARE_DATABASE_ID` | D1 database ID — only needed for `drizzle-kit`                                                         |
| `CLOUDFLARE_D1_TOKEN`    | Cloudflare API token with D1 edit permission — only needed for `drizzle-kit`                           |
| `SENTRY_ORG`             | Sentry organisation slug, used to upload source maps at build time                                     |
| `SENTRY_PROJECT`         | Sentry project slug                                                                                    |
| `VITE_SENTRY_DSN`        | Sentry DSN. Needed at build time because the Workers integration reads it at module load; not a secret |

### 3. Runtime secrets (`.dev.vars`)

Wrangler loads Worker secrets from `.dev.vars` locally (this file is git-ignored):

```bash
cp .dev.vars.example .dev.vars
```

| Variable               | Description                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`   | Random string used to sign sessions, e.g. `openssl rand -base64 32`                                                     |
| `BETTER_AUTH_URL`      | The origin you run the app on locally, e.g. `http://localhost:3000`. Overrides the production value in `wrangler.jsonc` |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App client ID                                                                                              |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret                                                                                          |
| `MAPTILER_API_KEY`     | MapTiler key, injected into the map styles by `/api/styles/:theme`                                                      |

Set the OAuth App's callback URL to `<BETTER_AUTH_URL>/api/auth/callback/github`.

For production, upload each secret with:

```bash
pnpm wrangler secret put <NAME>
```

### 4. Database

Migrations live in `lib/db/migrations` and are applied with Wrangler.

```bash
pnpm db:migrate          # apply to the local D1 database (.wrangler/state)
pnpm db:migrate:remote   # apply to the production D1 database
```

After changing a schema in `lib/db/schema/`, generate a new migration and commit it:

```bash
pnpm db:generate
```

`pnpm db:push` and `pnpm db:studio` connect to the **remote** D1 database through the HTTP API, so use them with care.

## Development

```bash
pnpm dev
```

This starts Nuxt on [http://localhost:3000](http://localhost:3000). `nitro-cloudflare-dev` provides the D1, R2 and `.dev.vars` bindings from Wrangler's local state, so no separate Wrangler process is needed.

The service worker is only built for production builds, so test PWA and offline behaviour with `pnpm preview`.

## Production build and preview

```bash
pnpm build     # output in .output/
pnpm preview   # build, then serve with `wrangler dev` on the Workers runtime
```

## Deploy

```bash
pnpm deploy
```

This builds and runs `wrangler deploy`, which publishes the Worker to the route in `wrangler.jsonc`. Apply any new migrations first with `pnpm db:migrate:remote`.

### Deploying your own copy

`wrangler.jsonc` is set up for the hosted instance at travel.kuzio.app. Before deploying a fork, replace every value marked `Deployment-specific` in it:

| Setting                             | Replace with                                                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `routes[].pattern`                  | Your custom domain, or remove `routes` to deploy to `<name>.<your-subdomain>.workers.dev`                                                    |
| `d1_databases[].database_id`        | The id printed by `pnpm wrangler d1 create travel-log`                                                                                       |
| `r2_buckets[]`                      | Your bucket: `pnpm wrangler r2 bucket create travel-log --jurisdiction eu` (omit `--jurisdiction` and the `jurisdiction` key outside the EU) |
| `vars.BETTER_AUTH_URL`              | Your app's origin. Its host is also allowed by Better Auth and sent to Nominatim as the User-Agent                                           |
| `vars.AUTH_ALLOWED_HOSTS`           | Comma-separated extra hosts that may sign in, such as your workers.dev URL, or `""`                                                          |
| `vars.SENTRY_ORG`, `SENTRY_PROJECT` | Your Sentry slugs (also set them and `VITE_SENTRY_DSN` in `.env`), or leave `VITE_SENTRY_DSN` empty to send nothing                          |

Then create your own GitHub OAuth App and MapTiler key, set the secrets with `pnpm wrangler secret put <NAME>`, run `pnpm db:migrate:remote` and `pnpm deploy`. Restrict the MapTiler key to your origin, and use your own app name and icons (see [License](#license)).

## Progressive web app

The app can be installed from the browser (Chrome/Edge show an **Install** button in the navbar; on iOS use _Share → Add to Home Screen_).

- The manifest and icons are configured under `pwa` in `nuxt.config.ts`.
- The service worker source is `service-worker/sw.ts`. It precaches the built assets, serves pages network-first with a cached fallback, and falls back to the client-rendered `/app-shell` page for routes that were never visited, so the app opens offline.
- New deployments are not activated silently: the app checks hourly and shows a "new version available" toast with a **Reload** button (`components/app/pwa-update.vue`).

### Offline reading

Anything viewed while online can be viewed again offline. A banner shows when the device is offline.

| What                                         | Cache        | Strategy                                        |
| -------------------------------------------- | ------------ | ----------------------------------------------- |
| Your locations, trips, types and the session | `api`        | Network first (4s timeout), then the saved copy |
| Photos (`/api/images/*`)                     | `images`     | Cache first, up to 500 photos for 60 days       |
| Map style (`/api/styles/*`)                  | `map-styles` | Saved copy, refreshed in the background         |
| MapTiler tiles, fonts and sprites            | `map-tiles`  | Cache first, up to 2,000 files for 30 days      |

Once per session the dashboard also fetches every location and trip (up to 100) and their cover photos in the background, so they open offline even if they were never visited (`composables/use-offline-prefetch.ts`). Place search needs a connection; offline, set the location with the map marker instead.

Signing out deletes the `pages`, `api` and `images` caches, because they hold your private data. Cache names are defined in `lib/pwa-caches.ts`.

The MapTiler key is restricted to approved origins, so map tiles (and their caching) only work on those origins. Requests from other origins, such as `wrangler dev` on a random port, get a 403.

### Offline changes

Adding, editing and deleting locations, trips, logs and photos also works offline. Changes are saved on the device (IndexedDB) and shown straight away with a **Not synced** badge. A cloud icon in the navbar counts what's waiting. When the connection returns, changes are sent in the order they were made: on load, when the device comes back online, when the app is reopened, and every minute.

- Something created offline gets a temporary address (`/dashboard/locations/offline_…`). It can be edited, have visits logged to it, or be picked for a trip before it syncs. Once synced, the page moves to the real address.
- Creates send an `Idempotency-Key` header, so a request that's retried after a dropped connection never creates a duplicate.
- If the server rejects a change (e.g. a duplicate name), it and anything that depends on it are marked as failed on **/dashboard/sync**, where they can be retried or discarded.
- Signing out with unsynced changes asks for confirmation, because they're deleted with the rest of the device's data.
- Location types and Google Takeout imports still need a connection.

To debug, run `pnpm preview` and use Chrome DevTools → **Application** (Manifest, Service workers, Cache storage, and IndexedDB → `travel-log-outbox` for queued changes). Tick _Offline_ on the Network tab to simulate losing connection.

## Useful commands

| Command                  | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `pnpm lint`              | Run ESLint (also formats; runs on staged files via Husky pre-commit) |
| `pnpm lint:fix`          | Run ESLint with auto-fix                                             |
| `pnpm check`             | Type-check with `nuxi typecheck`                                     |
| `pnpm db:generate`       | Generate a migration from schema changes                             |
| `pnpm db:migrate`        | Apply migrations to the local D1 database                            |
| `pnpm db:migrate:remote` | Apply migrations to the production D1 database                       |
| `pnpm db:studio`         | Open Drizzle Studio against the remote database                      |
| `pnpm cf-typegen`        | Regenerate Cloudflare binding types (`worker-configuration.d.ts`)    |

## External services

The app depends on these services. Each has its own terms, and a deployment needs its own account or key for each.

| Service                                                      | Used for                                                 | Needs                                                                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [Cloudflare Workers, D1 and R2](https://www.cloudflare.com/) | Hosting, database and photo storage                      | Cloudflare account                                                                                                      |
| [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps)   | Sign-in                                                  | OAuth App client id and secret                                                                                          |
| [MapTiler](https://www.maptiler.com/)                        | Vector tiles and fonts                                   | API key (restrict it to your origin)                                                                                    |
| [OpenStreetMap Nominatim](https://nominatim.org/)            | Place search, proxied and cached for a day by the server | Nothing, but follow the [usage policy](https://operations.osmfoundation.org/policies/nominatim/) (max 1 request/second) |
| [OpenMapTiles sprites](https://github.com/openmaptiles)      | Map icons, loaded from `openmaptiles.github.io`          | Nothing                                                                                                                 |
| [Sentry](https://sentry.io/)                                 | Error monitoring and source maps                         | Optional DSN and auth token                                                                                             |

## Privacy

See [PRIVACY.md](PRIVACY.md) for what the hosted app stores and shares. Sentry is configured to send as little personal data as possible (`sentry.client.config.ts`). If you change that, update the policy too.

## Contributing

Bug reports are welcome. Please use the [issue templates](https://github.com/oliverkuzio/travel-log/issues/new/choose). This is a personal project, so pull requests aren't being accepted at the moment, but you're free to fork it under the license below. Report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

The code is available under the [MIT License](LICENSE).

That covers the code only. It does not cover:

- **The Travel Log and Kuzio Apps names, logo and icons.** Please use your own branding for a public fork.
- **Content users create** on any deployment, such as locations, notes and photos.
- **The map styles** in `public/styles/`, which are modified copies of OpenMapTiles' Positron and Dark Matter. They are BSD-3-Clause (code) and CC BY 4.0 (design), see [public/styles/LICENSE.md](public/styles/LICENSE.md). Keep the OpenMapTiles and OpenStreetMap credits on the map.
- **Map data and tiles**: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) (ODbL), served by © [MapTiler](https://www.maptiler.com/copyright/) under MapTiler's terms.
