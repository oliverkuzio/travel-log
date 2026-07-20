# Travel Log | Kuzio Apps

Runs on Nuxt deployed to Cloudflare Workers with D1 (SQLite) and R2 (object storage). See the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Prerequisites

- [Node.js](https://nodejs.org/) (see `.nvmrc` or `engines` in `package.json`)
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) with Workers, D1, and R2 enabled
- A [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for authentication

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

| Variable                    | Description                                                                   |
| --------------------------- | ----------------------------------------------------------------------------- |
| `NODE_ENV`                  | Set to `development` locally                                                  |
| `NUXT_PUBLIC_S3_BUCKET_URL` | Public URL of the R2 bucket (also set in `wrangler.jsonc`)                    |
| `CLOUDFLARE_ACCOUNT_ID`     | Your Cloudflare account ID (needed for `drizzle-kit` only)                    |
| `CLOUDFLARE_DATABASE_ID`    | D1 database ID (needed for `drizzle-kit` only)                                |
| `CLOUDFLARE_D1_TOKEN`       | Cloudflare API token with D1 edit permissions (needed for `drizzle-kit` only) |
| `SENTRY_ORG`                | Sentry organisation slug (build-time source maps upload)                      |
| `SENTRY_PROJECT`            | Sentry project slug                                                           |

### 3. Local secrets (`.dev.vars`)

Wrangler loads secrets from `.dev.vars` during local development. Create the file:

```bash
touch .dev.vars
```

Add the following secrets (never commit this file):

```ini
AUTH_GITHUB_CLIENT_ID=        # GitHub OAuth App client ID (use a dev app)
AUTH_GITHUB_CLIENT_SECRET=    # GitHub OAuth App client secret
BETTER_AUTH_SECRET=           # Random secret, e.g. `openssl rand -hex 32`
BETTER_AUTH_URL=http://localhost:3000
S3_ACCESS_SECRET=             # R2 API token secret
VITE_SENTRY_DSN=              # Sentry DSN
```

For production, upload each secret with:

```bash
wrangler secret put <SECRET_NAME>
```

### 4. Database setup

Apply migrations to the local D1 database:

```bash
pnpm db:migrate:local
```

To apply migrations to the remote (production) D1 database:

```bash
pnpm db:migrate:remote
```

To generate new migrations after schema changes:

```bash
pnpm db:generate
```

### 5. Cloudflare R2 CORS

If you need to update the CORS policy on the R2 bucket, apply `r2-cors.json`:

```bash
wrangler r2 bucket cors put travel-log --rules-file r2-cors.json
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview the production build against the Cloudflare Workers runtime:

```bash
pnpm preview
```

## Deploy

Deploy the application to Cloudflare:

```bash
pnpm deploy
```

Deploy to the development environment:

```bash
pnpm deploy:dev
```

## Useful Commands

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `pnpm lint`       | Run ESLint                                 |
| `pnpm lint:fix`   | Run ESLint with auto-fix                   |
| `pnpm typecheck`  | Run TypeScript type checking               |
| `pnpm db:studio`  | Open Drizzle Studio to browse the database |
| `pnpm cf-typegen` | Regenerate Cloudflare Worker type bindings |
