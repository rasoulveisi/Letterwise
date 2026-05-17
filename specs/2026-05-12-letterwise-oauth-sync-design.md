# Letterwise OAuth sync design specification

## Goal

Add cross-device progress synchronization for signed-in users while preserving offline-first behavior: guests continue using local-only storage; signed-in users practice offline with eventual sync through a first-party backend.

The repo becomes a single Nx monorepo with:

- an Angular 21 frontend (`apps/web`) for learn/session UX, local-first state, Google OAuth entry points, and sync status; and
- a NestJS backend (`apps/api`) that owns authenticated progress sync APIs and talks to Supabase Postgres.

Supabase remains the managed infrastructure provider for Google OAuth, JWTs, Postgres, and RLS. Browser code must not directly write application progress tables.

## Context

Letterwise is currently an Angular 21 SPA at the repository root with per-script routes (`/:scriptId/learn/...`, `/:scriptId/session`). Progress is `AppProgress` v1 in `localStorage` keyed by `letterwise-v1-<scriptId>`, managed by `ProgressService` in the script shell. Scripts and exercises are bundled client-side; there is no API today.

The current script registry already exposes valid script IDs (`hy`, `ru`, `zh`). This design moves only metadata needed for validation into a shared scripts library; full alphabets, confusable pairs, and exercise content stay frontend-owned for MVP.

## Non-goals

- Replacing bundled script definitions with a CMS.
- Real-time multiplayer, leaderboards, or analytics.
- Email/password, magic-link auth, or Apple OAuth in the MVP. Google OAuth is the required provider.
- Guaranteed conflict-free concurrent editing beyond the timestamp merge policy below.
- Server-rendering the Angular app.
- Moving practice/progress logic to the backend; the client remains local-first.
- Backend rate limiting in the MVP.
- Strict per-letter-key validation against alphabets on the backend.

## Nx workspace structure

Use a staged Nx migration:

1. Add Nx around the current root Angular CLI project and get build/test targets green.
2. Rename/configure the Angular project as `web`.
3. Move the Angular app into `apps/web` only after the converted targets are green.
4. Add `apps/api` and shared libraries as separate checkpoints.

Target layout:

```text
apps/
  web/
  api/
libs/
  progress/domain/             # progress types, merge, migration, monotonic timestamp, equality helpers
  progress/contracts/          # light Zod schemas and DTO types
  scripts/domain/              # metadata-only valid script IDs
specs/
  supabase/
```

Recommended project names:

- `web` served locally on `http://localhost:4200`.
- `api` served locally on `http://localhost:3000`.
- Frontend dev calls `/api/*` through an Angular proxy or `apiBaseUrl`.

## Architecture

| Layer | Responsibility |
| --- | --- |
| Angular UI (`apps/web`) | Existing learn/session flows, local-first progress writes, Google OAuth UI, account/sync chip. |
| Angular auth client | Starts Google OAuth with Supabase, restores sessions, exposes access tokens, redirects back to the current route. |
| Local progress repository | Wraps browser storage; reads/writes v1 and v2; scans known local script keys; migrates v1 to v2 when sync activates. |
| Progress sync service | App-wide coordinator for auth changes, online events, active-script-first sync, background all-known-script catch-up, debounced snapshot pushes. |
| Script-scoped progress service | Keeps current in-memory progress state for the script shell and records practice outcomes immediately. |
| NestJS API (`apps/api`) | Verifies Supabase JWTs, validates route/user boundaries, validates only basic progress payload shape, server-merges writes, and uses user-scoped Supabase clients. |
| Shared libs | Hold progress domain helpers, progress contracts, and metadata-only script IDs. |
| Supabase | Google OAuth identities, JWT/JWKS, Postgres persistence, and RLS policies for own-row access. |

### Authentication and database access

- Angular obtains a Supabase OAuth session using `@supabase/supabase-js`.
- Angular attaches `session.access_token` to API calls as `Authorization: Bearer <token>`.
- NestJS verifies JWTs JWKS-first using `jose`, isolated behind a verifier interface so a JWT-secret verifier can be swapped in if project reality requires it.
- NestJS creates Supabase clients with the request JWT for progress DB reads/writes. RLS actively enforces `auth.uid() = user_id`.
- No Supabase service-role key is needed for the normal progress sync path, and no service-role key is exposed to the browser.
- On frontend `401`, try one Supabase session refresh/reload and retry once. If the retry still returns `401`, sign out locally and continue in local-only mode.

## API shape

Initial REST endpoints in `apps/api/src/app/progress`:

- `GET /api/progress/:scriptId` returns `200` with `{ scriptId, progress: AppProgressV2 | null, updatedAt: string | null }`. Missing rows return `progress: null`, not `404`.
- `GET /api/progress` returns all progress rows owned by the authenticated user, filtered to currently known script IDs from `libs/scripts/domain`.
- `PUT /api/progress/:scriptId` accepts `{ progress: AppProgressV2 }`, reads the current remote row, merges remote plus incoming using shared merge helpers, upserts the merged progress, and returns `{ scriptId, progress, updatedAt }`.

Validation:

- `scriptId` must be one of the shared metadata-only script IDs.
- Request progress validation is intentionally light for MVP: require `progress.version === 2` and `progress.letters` is a non-null object. Do not validate each letter key or each letter field's numeric bounds.
- Stored remote rows are validated before use. If a stored row is malformed, return `500` and log the validation failure; the frontend remains usable locally and can retry later.

## Data store

`public.user_script_progress`:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users (id) on delete cascade`
- `script_id text not null`
- `progress jsonb not null`
- `updated_at timestamptz not null default now()`
- unique `(user_id, script_id)`

Indexes:

- `user_id`
- optional later: `(user_id, updated_at desc)`

RLS:

- Enable RLS.
- Own-row policies for select, insert, update, and delete using `auth.uid() = user_id`.
- Because the API uses user-scoped Supabase clients, RLS is active enforcement, not just defense-in-depth.

No denormalized progress metadata columns are needed for MVP.

## Progress model and merge policy

- Current guest progress may remain v1.
- Sync progress is v2. Each letter entry includes `updatedAtMs`.
- Keep `HintLevel` as `0 | 1 | 2`, matching the current app.
- Use a small monotonic timestamp helper for local mutations: return `max(Date.now(), lastIssued + 1)` within the browser session.
- Merge per letter:
  - higher `updatedAtMs` wins;
  - equal timestamps or one missing timestamp prefer remote;
  - if both sides are legacy/missing timestamps, prefer local during migration to avoid regressions.
- Whole-row server `updated_at` is metadata and an optional optimization signal, not the source of merge truth.

Server-side `PUT` always merges current remote progress with incoming progress before upsert. The response returns the saved merged payload so clients can immediately update their local cache.

## Local storage and sync behavior

- Keep the existing `letterwise-v1-<scriptId>` storage keys, even after a script cache becomes v2.
- Brand-new guest progress can remain v1.
- Migrate v1 to v2 only when sync activates or is about to activate.
- Once a local script cache is v2, preserve v2 for future signed-out practice instead of downgrading.
- Sign-out keeps local progress. "Clear local progress on sign-out" is a later explicit privacy feature.
- If a different Google account signs in on the same browser profile, the current device-local progress merges into that account for MVP.
- Do not persist a separate operation queue. Local storage is the durable source of truth.
- On app load, sign-in, or reconnect: sync the active script first, then opportunistically scan all known script IDs and background-sync local progress keys.
- Pull flow: fetch remote, merge with local, save local, then schedule a debounced push only if the merged progress differs from remote.
- Push flow: send the current local v2 snapshot. The API server-merges and returns the canonical merged result; the client saves that result locally.
- API unavailable/offline behavior is non-blocking. Practice continues locally and sync retries later.

## Frontend components

- `AuthService`: app-wide Supabase browser auth wrapper. Exposes `session`, `user`, `accessToken`, and `signedIn`; supports Google sign-in and sign-out.
- `ProgressApiClient`: Angular `HttpClient` wrapper for progress endpoints; attaches bearer tokens.
- `ProgressRepository`: frontend storage abstraction over v1/v2 read/write, same-key migration, known-script scanning, and canonical saves.
- `ProgressSyncService`: app-wide sync coordinator for pull/merge/push, active-script-first bootstrap, all-known-script catch-up, online/auth subscriptions, debounced snapshot pushes, and status.
- `ProgressService`: script-shell-scoped service that records outcomes immediately and delegates sync scheduling.
- `PageNav`: evolves into the shared auth/sync header with Back, Home, and a compact account/sync chip. If the layout becomes awkward, home-only auth UI is the fallback.

The account chip should show subtle non-blocking states such as "Syncing", "Saved", "Offline", or "Pending". OAuth redirects back to the current route so signing in during practice preserves context.

## Shared libraries

- `libs/progress/domain`: `AppProgressV1`, `AppProgressV2`, `LetterProgress*`, `mergeProgressV2`, `migrateV1ToV2`, monotonic timestamp helper, deterministic equality helper, and tests.
- `libs/progress/contracts`: Zod schemas and inferred DTO types for `ProgressResponse`, `ProgressListResponse`, and `UpsertProgressRequest`. Runtime validation stays light: v2 plus `letters` object.
- `libs/scripts/domain`: metadata-only script registry for valid IDs and display metadata. Full script teaching content remains in the frontend.

## Testing strategy

- Shared unit tests for merge rules, migration, monotonic timestamp behavior, and deterministic equality.
- Frontend unit tests for v1/v2 storage behavior, repository migration, auth/sync services, debounced push scheduling, `401` refresh/retry fallback, and active-script-first/all-known-script sync ordering.
- Backend unit tests for auth rejection, known-script validation, missing-row `progress: null`, bulk GET filtering to known IDs, light DTO validation, malformed stored-row `500`, and server-side merge on `PUT`.
- Automated tests mock Supabase/database for MVP.
- Real Supabase Google OAuth, RLS behavior, and cross-device sync are manual verification steps.
- Once Nx exists, use `nx affected -t test,build` or equivalent CI targets.

## Success criteria

- Repo has a clear Nx shape with Angular frontend, NestJS backend, and shared libraries.
- Guest flow remains usable without signing in.
- Google OAuth sign-in works and returns to the route where sign-in started.
- Browser calls the NestJS API for progress sync and never writes `user_script_progress` directly.
- User can complete progress on device A, sign in on device B, and receive merged progress.
- Airplane mode practice continues; reconnect sync completes without data loss relative to the merge policy.
- Sync status is visible but non-blocking.
- Affected tests/builds pass.

## Risks

- **Nx migration churn:** Staged conversion and checkpoint commits keep failures diagnosable.
- **Clock skew:** Monotonic local timestamps protect same-device ordering but not cross-device clock skew. Accept for MVP.
- **Supabase JWT verification differences:** Keep verifier isolated; use JWKS-first and allow JWT-secret fallback if needed.
- **Shared-device privacy:** Local progress merges into the next signed-in Google account for MVP. Add clear-local or per-account local cache later if needed.
- **Abuse/quota:** Frontend debounces writes now; backend rate limiting is a deployment-aware follow-up.
