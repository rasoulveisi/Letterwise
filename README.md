# Letterwise

**Letterwise** is a small, **offline-first** web app for learning to **recognize letters** in real writing systems, not full language learning. Pick a script, walk through the character set and a few easy-to-confuse pairs, then practice with **hints that fade** as you improve. Signed-in users can sync progress through the first-party API; guests keep using local-only storage.

**MVP scripts:** Eastern Armenian (`hy`), Russian Cyrillic (`ru`), and a starter set of simplified Chinese characters (`zh`).

## What you get

- **Home** — choose a script and open the learn flow.
- **Learn** — alphabet overview, confusable-pair intros, then match exercises. Progress is reflected in the URL (`/:scriptId/learn/:stepIndex`) so you can bookmark or go back step-by-step.
- **Session** — mixed letter-pick and minimal-pair exercises with per-letter hint levels stored locally.
- **Progress** — saved in the browser under keys like `letterwise-v1-<scriptId>` (per script), with v2 snapshots synced for signed-in users.

## Tech stack

- [Angular](https://angular.dev/) **21** (standalone components, signals, `provideRouter`)
- [Nx](https://nx.dev/) monorepo with `apps/web`, `apps/api`, and shared libraries
- [NestJS](https://nestjs.com/) API for authenticated progress sync
- [Supabase](https://supabase.com/) for Google OAuth, JWTs, Postgres, and RLS
- [Tailwind CSS](https://tailwindcss.com/) **4** (utility-first styling)
- Unit tests via **Vitest** and **Jest**

## Prerequisites

- **Node.js** (LTS recommended) and **npm**

## Quick start

Install dependencies:

```bash
npm install
```

Run the API and web dev servers:

```bash
npx nx serve api
npx nx serve web
```

The web app is served at `http://localhost:4200/`; the API is served at `http://localhost:3000/api`. During web development, `/api` is proxied to the NestJS server.

Production builds:

```bash
npx nx run-many -t build
```

Run tests:

```bash
npx nx run-many -t test
```

## Configuration

Copy the local config templates once:

```bash
cp apps/web/src/environments/environment.local.example.ts apps/web/src/environments/environment.local.ts
cp apps/web/src/environments/environment.local.prod.example.ts apps/web/src/environments/environment.local.prod.ts
cp apps/api/.env.example apps/api/.env.local
```

Then paste your Supabase values into the ignored local files.

Frontend local files:

- `apps/web/src/environments/environment.local.ts`
- `apps/web/src/environments/environment.local.prod.ts`

```ts
supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co'
supabasePublishableKey: 'YOUR_PUBLISHABLE_KEY'
```

Use the `sb_publishable_...` key from Supabase `Settings > API Keys`. Publishable keys are public by design, but real values should still come from local overrides or deployment injection. Backend secret keys must never be exposed to browser code.

Backend local file:

- `apps/api/.env.local`

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_JWKS_URL=https://YOUR_PROJECT_REF.supabase.co/auth/v1/.well-known/jwks.json
WEB_ORIGIN=http://localhost:4200
PORT=3000
```

For GitHub Actions or another CI provider, set these environment variables in the deployment/build environment:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The `web` Nx targets run `node tools/write-web-env.mjs` before build/test/serve. That script generates Angular's ignored `environment.local*.ts` files from `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, so CI does not need committed local env files. The API reads the same process environment directly, plus `SUPABASE_JWKS_URL`, `WEB_ORIGIN`, and `PORT` at runtime.

The normal sync path uses user-scoped Supabase clients with the request JWT, so RLS enforces `auth.uid() = user_id`. No service-role key is required for progress sync.

## Supabase setup

Run `specs/supabase/001_user_script_progress.sql` in Supabase SQL editor or through the Supabase CLI. Enable Google OAuth and add local, production, and preview redirect URLs that cover route paths, since sign-in redirects back to the current route.

For a production deployment:

- Supabase project URL: `https://YOUR_PROJECT_REF.supabase.co`
- Production web URL: `https://YOUR_NETLIFY_SITE.netlify.app`
- Production API URL: `https://YOUR_RENDER_SERVICE.onrender.com/api`

Supabase `Authentication > URL Configuration`:

```text
Site URL: https://YOUR_NETLIFY_SITE.netlify.app

Redirect URLs:
https://YOUR_NETLIFY_SITE.netlify.app
https://YOUR_NETLIFY_SITE.netlify.app/**
http://localhost:4200
http://localhost:4200/**
```

Google Cloud OAuth client:

```text
Authorized redirect URI:
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Do not use `localhost:3000` as a Supabase auth callback or site URL. `localhost:3000` is only the local API server.

Synced progress is stored as JSON in `public.user_script_progress`. The browser calls the NestJS API; it does not directly write application progress tables.

## Deploying a release

The production deployment uses Netlify for the Angular SPA and Render for the NestJS API.

### Render API

Render service:

- Type: Web Service
- Runtime: Node
- Root directory: repository root
- Build command: `npm ci && npx nx build api`
- Start command: `node dist/apps/api/main.js`

Render environment:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_JWKS_URL=https://YOUR_PROJECT_REF.supabase.co/auth/v1/.well-known/jwks.json
WEB_ORIGIN=https://YOUR_NETLIFY_SITE.netlify.app
NODE_VERSION=20
```

Render provides `PORT`; do not hard-code it. Health check:

```bash
curl https://YOUR_RENDER_SERVICE.onrender.com/api/health
```

Expected:

```json
{"status":"ok"}
```

### Netlify Web

Netlify site:

- Build command: `npm ci && npx nx build web`
- Publish directory: `dist/apps/web/browser`

Netlify environment:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

These values must be set in Netlify, even if they are also set in GitHub. GitHub repository or environment variables are not automatically available to Netlify builds.

The web app is a **static SPA**. `apps/web/public/_redirects` contains both the API proxy and SPA fallback:

```text
/api/* https://YOUR_RENDER_SERVICE.onrender.com/api/:splat 200
/* /index.html 200
```

After Netlify deploys, verify the proxy:

```bash
curl https://YOUR_NETLIFY_SITE.netlify.app/api/health
```

Expected:

```json
{"status":"ok"}
```

### Production OAuth Troubleshooting

If clicking `Sign in` does nothing, inspect the deployed JavaScript bundle for placeholders:

```text
YOUR_PROJECT_REF
YOUR_PUBLISHABLE_KEY
```

If either appears, Netlify built without `SUPABASE_URL` or `SUPABASE_PUBLISHABLE_KEY`. Add the environment variables in Netlify and redeploy with cache cleared.

If Google login returns to `localhost:3000`, Supabase `Site URL` is wrong. Set it to your Netlify site URL.

If Supabase `/auth/v1/user` returns `Invalid API key`, the `SUPABASE_PUBLISHABLE_KEY` value in Netlify is missing, truncated, quoted, or copied from the wrong Supabase project.

Never paste OAuth `access_token` or `refresh_token` values into issue trackers, docs, or chat. Revoke the session in Supabase if that happens.

## Privacy

Guests keep progress on the device in `localStorage`. Signed-in users keep the same local cache and sync snapshots through the API.

For the MVP, signing into a different Google account on the same browser profile merges the current device-local progress into that account. Sign-out keeps local progress. Backend rate limiting is deferred; frontend writes are debounced.

## License

Add a `LICENSE` file if you publish or open-source the project.
