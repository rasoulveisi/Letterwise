# Agent Notes

This file gives future coding agents the project context needed to work in this repository without rediscovering the same deployment, auth, and Nx details.

## Project Overview

Letterwise is an offline-first Angular app for recognizing letters in real writing systems. It is not a general language-learning app.

The app supports:

- Local guest progress in browser storage.
- Google sign-in through Supabase Auth.
- Signed-in progress sync through the first-party NestJS API.
- Script learning flows for Armenian (`hy`), Russian (`ru`), and starter Chinese (`zh`).

The repo was previously named `Alphabet`; some older chats, plans, and remote history may still use that name. Treat the current repo name as `letterwise`.

## Repository Layout

- `apps/web` - Angular 21 standalone app.
- `apps/api` - NestJS API for health checks and authenticated progress sync.
- `libs/scripts/domain` - shared script metadata/domain helpers.
- `libs/progress/domain` - progress merge/snapshot domain logic.
- `libs/progress/contracts` - shared API contract schemas/types.
- `specs/plans` - implementation plans.
- `specs/supabase` - Supabase SQL migrations/setup scripts.
- `tools/write-web-env.mjs` - generates ignored Angular local environment files from env vars.

## Common Commands

Install dependencies:

```bash
npm install
```

Run local development servers:

```bash
npx nx serve api
npx nx serve web
```

Run tests:

```bash
npx nx test web
npx nx test api
npx nx test scripts-domain
npx nx test progress-domain
npx nx test progress-contracts
npx nx run-many -t test
```

Build:

```bash
npx nx build web
npx nx build api
npx nx run-many -t build
```

Use the narrowest relevant test/build target for small changes, then broaden verification when touching shared libraries, auth, sync, routing, or deployment config.

## Environment And Secrets

Do not commit real Supabase, Netlify, Render, OAuth, access-token, or refresh-token values to docs or source files. Use placeholders in docs:

```text
https://YOUR_PROJECT_REF.supabase.co
https://YOUR_NETLIFY_SITE.netlify.app
https://YOUR_RENDER_SERVICE.onrender.com
YOUR_PUBLISHABLE_KEY
```

Local env templates:

- `.env.example`
- `apps/api/.env.example`
- `apps/web/src/environments/environment.local.example.ts`
- `apps/web/src/environments/environment.local.prod.example.ts`

Ignored local files:

- `.env.local`
- `apps/api/.env.local`
- `apps/web/src/environments/environment.local.ts`
- `apps/web/src/environments/environment.local.prod.ts`

The web build/test/serve targets run `node tools/write-web-env.mjs`. That script reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from environment files or process env and writes the ignored Angular local environment files. If real values are missing, it creates placeholder files so local builds still work.

The browser must only receive the Supabase publishable key. Never expose a service-role key in frontend code.

## Auth And Sync Model

Supabase handles Google OAuth and JWT issuance. The Angular app stores progress locally and, when signed in, syncs snapshots through the NestJS API.

The API verifies Supabase JWTs using `SUPABASE_JWKS_URL`, then uses user-scoped Supabase clients so RLS enforces `auth.uid() = user_id`.

Progress data lives in `public.user_script_progress`; setup SQL is in:

```text
specs/supabase/001_user_script_progress.sql
```

Important OAuth lessons from the old deployment thread:

- If production sign-in does nothing, inspect the deployed JS bundle for `YOUR_PROJECT_REF` or `YOUR_PUBLISHABLE_KEY`; the frontend was probably built without Netlify env vars.
- If Google login returns to `localhost:3000`, Supabase Auth `Site URL` is wrong. `localhost:3000` is the API, not the web app.
- If Supabase `/auth/v1/user` returns `Invalid API key`, the publishable key in the frontend deployment is missing, truncated, quoted, copied from the wrong project, or stale.
- If an OAuth `access_token` or `refresh_token` is pasted into chat/issues/docs, tell the user to revoke the session in Supabase and sign in again.

## Deployment Shape

Production uses:

- Netlify for the static Angular SPA.
- Render for the long-running NestJS API.
- Supabase for Auth, Postgres, JWTs, and RLS.

Netlify should build from the repository root:

```bash
npm ci && npx nx build web
```

Publish directory:

```text
dist/apps/web/browser
```

Render should build from the repository root:

```bash
npm ci && npx nx build api
```

Start command:

```bash
node dist/apps/api/main.js
```

Render provides `PORT`; do not hard-code it.

Netlify `_redirects` must keep the API proxy above the SPA fallback:

```text
/api/* https://YOUR_RENDER_SERVICE.onrender.com/api/:splat 200
/* /index.html 200
```

The actual deployment config may contain real hostnames, but documentation should use placeholders unless the user explicitly asks otherwise.

## Coding Guidelines

- Prefer existing Angular standalone component patterns and signal-based state.
- Keep script/domain logic in shared libs when it is used by more than one app boundary.
- Keep browser persistence details in web services/core storage code, not in UI components.
- Keep API request/response shapes aligned with `libs/progress/contracts`.
- Use structured schemas/contracts instead of ad hoc object parsing when changing API payloads.
- Preserve offline-first behavior: guests must keep local progress; signed-in users sync without making local practice dependent on the network.
- Do not silently drop local progress during auth changes. The current MVP merges device-local progress into the signed-in account.

## Testing Guidance

Use Vitest for Angular/shared library tests and Jest for the Nest API tests.

Recommended checks by change type:

- UI-only Angular change: `npx nx test web` and `npx nx build web`.
- API auth/progress change: `npx nx test api` and `npx nx build api`.
- Shared progress logic: `npx nx test progress-domain progress-contracts`, then relevant app tests.
- Script metadata/learning flow: `npx nx test scripts-domain web`.
- Deployment/env changes: run the relevant build and inspect generated env behavior carefully.

For auth or deployment debugging, verify:

```bash
curl https://YOUR_RENDER_SERVICE.onrender.com/api/health
curl https://YOUR_NETLIFY_SITE.netlify.app/api/health
```

Use placeholders in committed documentation and final notes unless the user explicitly wants the real URLs repeated.

## Git And Safety Notes

- The worktree may contain user changes. Do not revert unrelated files.
- Use `rg` for search.
- Use `apply_patch` for manual edits.
- Avoid destructive git commands unless the user explicitly asks.
- Before claiming completion, run the smallest meaningful verification and report exactly what passed or what could not be run.
