# Letterwise OAuth sync — design specification

## Goal

Add **cross-device progress synchronization** for signed-in users while preserving **offline-first behavior**: guests continue using local-only storage; signed-in users practice offline with **eventual sync** to a managed backend (**Supabase**: Postgres + Auth + OAuth providers).

## Context

Letterwise is an Angular 21 SPA with per-script routes (`/:scriptId/learn/...`, `/:scriptId/session`). Progress is **`AppProgress` v1** in `localStorage` keyed by `letterwise-v1-<scriptId>`, managed by `ProgressService` in the script shell. Scripts and exercises are **bundled** client-side; there is no API today.

## Non-goals (this iteration)

- Replacing bundled script definitions with a CMS.
- Real-time multiplayer or leaderboards.
- Email/password or magic-link auth (OAuth only per product choice).
- Guaranteed conflict-free concurrent editing beyond the merge policy below.

## Architecture

### Boundaries

| Layer | Responsibility |
|--------|----------------|
| **Angular UI** | Unchanged learn/session flows; optional auth affordances (sign in / out, sync status). |
| **Auth** | Supabase Auth with OAuth (Google / Apple per provider configuration). Session exposed as signals or observables consumed by sync logic. |
| **Local progress cache** | Same UX latency as today: reads/writes hit **local state first** (`localStorage` + in-memory signals). |
| **Sync layer** | After local mutation: enqueue remote upsert when online and authenticated. On login or reconnect: pull remote row(s), **merge** into local using policy below. |
| **Supabase** | `auth.users` via OAuth; application table(s) for progress with **RLS** so users only read/write their own rows. |

### Data store

- **Table (conceptual):** `user_script_progress` with at least `user_id` (uuid, FK to auth), `script_id` (text, matches route param), `progress` (JSONB aligned with client schema), `updated_at` (timestamptz, maintained by DB defaults/triggers or application).

### Merge policy

- **Guest:** No change from current behavior (`AppProgress` v1).
- **Signed-in:** Progress payload moves to **version 2** client-side: each letter entry includes an **`updatedAtMs`** (monotonic client timestamp at mutation time) for merge decisions.
- **Merge when pulling remote:** For each letter key present in either local or remote JSON, keep the copy whose **`updatedAtMs` is greater**. If equal or one side lacks `updatedAtMs`, prefer **remote** for that key (server wins stale ties); if both sides missing timestamps (legacy), prefer **local** to avoid regressions during migration.

Whole-row **server `updated_at`** is used for optional “skip fetch if unchanged” optimization (If-Modified-Since pattern or select where newer only), not as the sole merge source for individual letters.

### Offline and errors

- **Offline / unsigned:** Local mutations behave exactly like today; sync queue holds pending upserts per `(scriptId)` until network + session available.
- **Sign-out:** Keep local cache on device (optional UX: clear only remote session); next sign-in merges again from server.
- **Failed sync:** Retry with backoff; surface non-blocking UI (e.g. subtle “Sync pending”) without blocking practice.

### Privacy

- OAuth identities are handled by Supabase; progress payloads remain **opaque JSON** to the backend except for RLS ownership.
- Document in README that synced data resides in the operator’s Supabase project.

## Components (implementation-facing)

### Client

- **`AuthService` (new):** Wraps Supabase client `auth.getSession()`, `onAuthStateChange`, `signInWithOAuth`, `signOut`. Exposes `user`, `session`, `signedIn` signals.
- **`ProgressSyncService` (new)** or **refactored `ProgressService`:** Owns load → merge → save local → enqueue remote. Depends on `AuthService`, `ScriptContextService`, and thin storage helpers.
- **`progress-storage` (extend):** v1 read path unchanged; v2 read/write for signed-in mode including migration from v1 when enabling sync (set `updatedAtMs` from migration time for existing letters).
- **Shell / home:** Entry points for “Sign in” / account chip; no change to exercise components if outcomes still flow through one progress API.

### Server (Supabase)

- SQL migration: table + indexes (`user_id`, `script_id` unique composite).
- **RLS policies:** `SELECT`/`INSERT`/`UPDATE`/`DELETE` only where `auth.uid() = user_id`.
- Auth redirect URLs configured for production and local dev (`http://localhost:4200`).

## Data flow

1. **App load (signed in):** Restore session from Supabase; for current `scriptId`, fetch row if online; merge into local v2; hydrate `ProgressService` state.
2. **Practice:** `recordLetterOutcome` updates local state immediately; persists local storage; appends sync job (same tick or microtask).
3. **Online flush:** Upsert JSON to `user_script_progress`; on success, dequeue; on failure, retry later.
4. **Second device:** Same merge pulls newer per-letter `updatedAtMs` so no master device is required.

## Testing strategy

- **Unit:** Merge pure function (two `AppProgress` v2 blobs → merged blob) with fixtures for timestamp ties and missing keys.
- **Unit:** Storage migration v1 → v2 preserves letter stats and assigns timestamps.
- **Integration (optional CI):** Mock Supabase client or test against a disposable Supabase branch using env vars (behind flag) — not required for initial merge if unit coverage is strong.

## Success criteria

- Guest flow unchanged without signing in.
- User can sign in with OAuth (Google/Apple as configured), complete a session on device A, sign in on device B, and see merged progress after sync.
- Airplane mode: practice continues; sync completes after reconnect without data loss relative to merge policy.

## Risks

- **Clock skew:** Per-letter `updatedAtMs` uses client clock; skew can mis-order merges. Mitigation: optional server “ingest” timestamp later; accept minor skew for MVP.
- **Quota / abuse:** Rate-limit upserts at API gateway or Supabase settings if needed later.
