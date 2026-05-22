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

Synced progress is stored as JSON in `public.user_script_progress`. The browser calls the NestJS API; it does not directly write application progress tables.

## Deploying a release

The web app is a **static SPA**. Configure your host so **all paths** serve `index.html` (HTTP 200), or ship the included SPA rule from `apps/web/public/_redirects` with your static files (for example on **Netlify**).

Publish the browser output folder produced by `npx nx build web` (currently `dist/apps/web/browser/`). Deploy the API as a Node service with the backend environment variables above.

## Privacy

Guests keep progress on the device in `localStorage`. Signed-in users keep the same local cache and sync snapshots through the API.

For the MVP, signing into a different Google account on the same browser profile merges the current device-local progress into that account. Sign-out keeps local progress. Backend rate limiting is deferred; frontend writes are debounced.

## License

Add a `LICENSE` file if you publish or open-source the project.
