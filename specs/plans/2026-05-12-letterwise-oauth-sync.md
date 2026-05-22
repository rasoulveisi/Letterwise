# Letterwise OAuth + NestJS/Supabase sync implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the repo into an Nx monorepo with Angular frontend (`apps/web`), NestJS backend (`apps/api`), and shared libraries, then implement Google OAuth sign-in and authenticated cross-device progress sync through the NestJS API while preserving offline-first UX.

**Approved design:** `specs/2026-05-12-letterwise-oauth-sync-design.md`

**Key decisions:**

- Staged Nx migration: convert first, move to `apps/web` second.
- Google OAuth only for MVP.
- NestJS verifies JWTs JWKS-first and uses user-scoped Supabase clients for progress DB access.
- RLS actively enforces row ownership.
- Same local storage keys: `letterwise-v1-<scriptId>`.
- Brand-new guest progress can stay v1; sync activation migrates to v2; once v2, preserve v2.
- No persisted operation queue; sync snapshots from local storage.
- Active script syncs first, then all known local script keys sync in the background.
- `GET /api/progress/:scriptId` returns `200` with `progress: null` for missing rows.
- `GET /api/progress` lists rows for known script IDs.
- `PUT /api/progress/:scriptId` server-merges remote plus incoming before upsert and returns saved merged progress.
- API validation is intentionally light: valid `scriptId`, `progress.version === 2`, and `letters` is a non-null object.
- Keep `HintLevel = 0 | 1 | 2`.
- Frontend auth/sync is app-wide; current progress state stays script-shell scoped.
- Account/sync UI belongs in shared `PageNav`, with home-only fallback if layout gets awkward.

---

## Target workspace layout

```text
apps/
  web/
  api/
libs/
  progress/domain/
  progress/contracts/
  scripts/domain/
specs/
  supabase/001_user_script_progress.sql
```

## Task 1: Introduce Nx without moving files yet

**Files:**

- Create/modify: `nx.json`, workspace/project config, `package.json`, lockfile
- Keep initially: current root `src/**`, `public/**`, Angular config

- [ ] **Step 1: Add Nx locally**

Run the official Angular-to-Nx initialization flow, adjusting for the installed Nx version:

```bash
npx nx@latest init
```

Expected: Nx dependencies/config are added and the current Angular app still behaves the same.

- [ ] **Step 2: Name the Angular project `web`**

Configure the existing root Angular project as Nx project `web` before moving directories.

- [ ] **Step 3: Update scripts**

Use Nx scripts while preserving the normal developer commands:

```json
{
  "start": "nx serve web",
  "build": "nx build web",
  "test": "nx test web",
  "test:all": "nx run-many -t test",
  "affected": "nx affected -t test,build"
}
```

- [ ] **Step 4: Verify**

```bash
npx nx test web
npx nx build web
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: introduce Nx for Angular app"
```

---

## Task 2: Move Angular app to `apps/web`

**Files:**

- Move: `src/**` to `apps/web/src/**`
- Move: `public/**` to `apps/web/public/**` or configure assets accordingly
- Modify: Angular/Nx project config, tsconfigs, path references, package scripts if needed

- [ ] **Step 1: Move app files**

Move the Angular project into `apps/web` and update source roots, browser entry, assets, styles, tsconfig paths, and test config.

- [ ] **Step 2: Keep route behavior unchanged**

Verify existing routes still work: `/`, `/hy/learn/0`, `/ru/session`, etc.

- [ ] **Step 3: Verify**

```bash
npx nx test web
npx nx build web
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: move Angular app to apps/web"
```

---

## Task 3: Add NestJS API and shared libraries

**Files:**

- Create: `apps/api/**`
- Create: `libs/progress/domain/**`
- Create: `libs/progress/contracts/**`
- Create: `libs/scripts/domain/**`
- Modify: `tsconfig.base.json` or Nx path mappings

- [ ] **Step 1: Generate NestJS app**

```bash
npm install -D @nx/nest
npx nx g @nx/nest:app api
```

Expected: `apps/api` exists and can serve on `http://localhost:3000`.

- [ ] **Step 2: Generate shared libs**

Use generator flags appropriate for the installed Nx version:

```bash
npx nx g @nx/js:lib progress-domain --directory=libs/progress/domain --bundler=tsc --unitTestRunner=vitest
npx nx g @nx/js:lib progress-contracts --directory=libs/progress/contracts --bundler=tsc --unitTestRunner=vitest
npx nx g @nx/js:lib scripts-domain --directory=libs/scripts/domain --bundler=tsc --unitTestRunner=vitest
```

Target import aliases:

- `@letterwise/progress/domain`
- `@letterwise/progress/contracts`
- `@letterwise/scripts/domain`

- [ ] **Step 3: Add API health endpoint**

Expose `GET /api/health` returning a simple status payload.

- [ ] **Step 4: Verify**

```bash
npx nx test api
npx nx build api
npx nx test progress-domain
npx nx test progress-contracts
npx nx test scripts-domain
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: add NestJS API and shared libraries"
```

---

## Task 4: Add Supabase schema

**Files:**

- Create: `specs/supabase/001_user_script_progress.sql`

- [ ] **Step 1: Add SQL migration**

Create an idempotent SQL file:

```sql
-- Run in Supabase SQL editor or through Supabase CLI.

create table if not exists public.user_script_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  script_id text not null,
  progress jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, script_id)
);

create index if not exists user_script_progress_user_id_idx
  on public.user_script_progress (user_id);

alter table public.user_script_progress enable row level security;

create policy "user_script_progress_select_own"
  on public.user_script_progress for select
  using (auth.uid() = user_id);

create policy "user_script_progress_insert_own"
  on public.user_script_progress for insert
  with check (auth.uid() = user_id);

create policy "user_script_progress_update_own"
  on public.user_script_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_script_progress_delete_own"
  on public.user_script_progress for delete
  using (auth.uid() = user_id);

create or replace function public.set_user_script_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_script_progress_updated_at on public.user_script_progress;
create trigger trg_user_script_progress_updated_at
  before update on public.user_script_progress
  for each row
  execute function public.set_user_script_progress_updated_at();
```

- [ ] **Step 2: Apply in Supabase manually**

Run the SQL in the Supabase project. Confirm the table, unique constraint, index, trigger, and policies exist.

- [ ] **Step 3: Configure Supabase Auth**

Enable Google OAuth. Add local, production, and preview redirect URLs. The app redirects back to the current route, so allowed redirect patterns must cover route paths.

- [ ] **Step 4: Commit**

```bash
git add specs/supabase/001_user_script_progress.sql
git commit -m "chore: add Supabase progress schema"
```

---

## Task 5: Shared scripts metadata library

**Files:**

- Create/modify: `libs/scripts/domain/**`
- Modify: `apps/web/src/app/core/script-registry.ts`
- Modify: `apps/web/src/app/pages/script-shell/script-shell.ts`

- [ ] **Step 1: Define metadata-only script IDs**

Move only the validation/display subset into `libs/scripts/domain`, for example:

```typescript
export interface ScriptMetadata {
  readonly id: 'hy' | 'ru' | 'zh';
  readonly name: string;
  readonly nativeLabel: string;
  readonly tagline: string;
}
```

Export `ALL_SCRIPT_METADATA`, `KNOWN_SCRIPT_IDS`, and `isKnownScriptId`.

- [ ] **Step 2: Keep full teaching content frontend-owned**

`apps/web` keeps alphabets, confusable pairs, and exercise definitions. Its full registry can compose local script definitions with shared metadata.

- [ ] **Step 3: Update route validation imports**

Use shared `isKnownScriptId` where backend and frontend both need only ID validation.

- [ ] **Step 4: Verify and commit**

```bash
npx nx test scripts-domain
npx nx test web
git add .
git commit -m "feat(scripts): share script metadata for validation"
```

---

## Task 6: Shared progress domain and contracts

**Files:**

- Create/modify: `libs/progress/domain/**`
- Create/modify: `libs/progress/contracts/**`
- Modify: `apps/web/src/app/core/models.ts` or re-export strategy

- [ ] **Step 1: Define progress types**

Keep hint levels aligned with the current app:

```typescript
export type HintLevel = 0 | 1 | 2;

export interface LetterProgressV1 {
  readonly hintLevel: HintLevel;
  readonly consecutiveCorrect: number;
  readonly wrongAnswers: number;
}

export interface LetterProgressV2 extends LetterProgressV1 {
  readonly updatedAtMs: number;
}

export interface AppProgressV1 {
  readonly version: 1;
  readonly letters: Readonly<Record<string, LetterProgressV1>>;
}

export interface AppProgressV2 {
  readonly version: 2;
  readonly letters: Readonly<Record<string, LetterProgressV2>>;
}

export type AppProgress = AppProgressV1 | AppProgressV2;
```

- [ ] **Step 2: Write tests first**

Cover:

- higher `updatedAtMs` wins;
- timestamp tie prefers remote;
- one missing timestamp prefers remote;
- both missing timestamps prefer local during migration;
- v1 migration assigns a fixed timestamp;
- monotonic timestamp helper never goes backward in a browser session;
- deterministic equality detects same/different v2 progress independent of key order.

- [ ] **Step 3: Implement helpers**

Implement `mergeProgressV2`, `migrateV1ToV2`, `createMonotonicTimestamp`, and `progressV2Equals`.

- [ ] **Step 4: Define light Zod contracts**

Use Zod in `libs/progress/contracts`, but keep validation intentionally light:

- `progress.version === 2`
- `progress.letters` is a non-null object
- no per-letter-key validation
- no numeric-bound validation for letter fields

Export inferred types for:

- `ProgressResponse`
- `ProgressListResponse`
- `UpsertProgressRequest`

- [ ] **Step 5: Verify and commit**

```bash
npx nx test progress-domain
npx nx test progress-contracts
npx nx test web
git add .
git commit -m "feat(progress): share progress domain and contracts"
```

---

## Task 7: Frontend environment, Google OAuth, and API client

**Files:**

- Create/modify: `apps/web/src/environments/environment.ts`
- Create/modify: `apps/web/src/environments/environment.prod.ts`
- Create: `apps/web/proxy.conf.json`
- Create: `apps/web/src/app/services/supabase-browser.factory.ts`
- Create: `apps/web/src/app/services/auth.service.ts`
- Create: `apps/web/src/app/services/progress-api.client.ts`
- Modify: `apps/web/src/app/app.config.ts`

- [ ] **Step 1: Install Supabase browser client**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2: Add safe frontend placeholders**

Commit placeholder config shape, not real private secrets:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabasePublishableKey: 'YOUR_PUBLISHABLE_KEY',
  apiBaseUrl: '/api',
};
```

Real values come from local uncommitted overrides or deployment/CI injection. Use the current Supabase publishable key (`sb_publishable_...`) for browser code; backend secret keys are never frontend config.

- [ ] **Step 3: Add dev proxy**

`apps/web/proxy.conf.json` proxies `/api` to `http://localhost:3000`, and `web:serve` uses it.

- [ ] **Step 4: Add `AuthService`**

Expose `session`, `user`, `accessToken`, and `signedIn`. Implement Google sign-in with redirect back to the current route.

- [ ] **Step 5: Add `ProgressApiClient`**

Support:

- `GET /api/progress/:scriptId`
- `GET /api/progress`
- `PUT /api/progress/:scriptId`

Attach bearer tokens and implement one refresh/retry on `401`; if retry still fails, fall back to local sign-out behavior.

- [ ] **Step 6: Verify and commit**

```bash
npx nx test web
npx nx build web
git add .
git commit -m "feat(web): add Google OAuth and progress API client"
```

---

## Task 8: Backend auth, user-scoped Supabase access, and progress API

**Files:**

- Create: `apps/api/src/app/auth/**`
- Create: `apps/api/src/app/supabase/**` or `apps/api/src/app/database/**`
- Create: `apps/api/src/app/progress/**`
- Modify: `apps/api/src/main.ts`
- Modify: API config/env docs

- [ ] **Step 1: Install backend dependencies**

```bash
npm install @supabase/supabase-js @nestjs/config jose zod
```

- [ ] **Step 2: Configure server env**

Required:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_JWKS_URL=https://YOUR_PROJECT_REF.supabase.co/auth/v1/.well-known/jwks.json
WEB_ORIGIN=http://localhost:4200
PORT=3000
```

Do not require `SUPABASE_SERVICE_ROLE_KEY` for normal progress sync. Keep verifier isolated so `SUPABASE_JWT_SECRET` can be added only if JWKS is unavailable.

- [ ] **Step 3: Implement auth guard**

`SupabaseAuthGuard`:

1. reads `Authorization: Bearer <token>`;
2. verifies JWT JWKS-first through an injected verifier interface;
3. attaches authenticated user id/email to the request;
4. rejects missing/invalid tokens with `401`.

- [ ] **Step 4: Implement user-scoped Supabase provider**

Create a request/user-token-scoped Supabase client for DB operations so RLS uses `auth.uid()`.

- [ ] **Step 5: Implement progress endpoints**

Controller:

- `GET /api/progress/:scriptId`
- `GET /api/progress`
- `PUT /api/progress/:scriptId`

Service:

- validates `scriptId` via `@letterwise/scripts/domain`;
- returns `progress: null` for missing per-script rows;
- bulk GET filters to known script IDs;
- validates stored rows and returns/logs `500` on malformed stored progress;
- validates incoming progress using the light Zod contract;
- reads current remote before `PUT`;
- merges remote plus incoming using `mergeProgressV2`;
- upserts merged progress with conflict target `(user_id, script_id)`;
- returns saved merged progress and `updatedAt`.

- [ ] **Step 6: Add tests**

Cover auth rejection, known-script rejection, missing-row response, bulk GET filtering, light DTO validation, malformed stored-row failure, user-scoped client usage, and server-side merge on `PUT`.

- [ ] **Step 7: Verify and commit**

```bash
npx nx test api
npx nx build api
git add .
git commit -m "feat(api): add authenticated progress sync endpoints"
```

---

## Task 9: Frontend progress repository and v1/v2 storage behavior

**Files:**

- Modify: `apps/web/src/app/core/progress-storage.ts`
- Create/modify: `apps/web/src/app/core/progress-storage.spec.ts`
- Create: `apps/web/src/app/services/progress.repository.ts`
- Create/modify tests for repository behavior

- [ ] **Step 1: Write failing tests**

Cover:

- brand-new guest progress creates v1;
- v1 reads remain valid;
- sync activation migrates v1 to v2 under the same key;
- once a key is v2, signed-out practice preserves v2;
- known script key scanning finds `letterwise-v1-<scriptId>` for shared known IDs only;
- canonical v2 saves keep the same key.

- [ ] **Step 2: Implement repository**

Centralize local storage reads/writes, migration, scan-all-known-script behavior, and canonical saves. Avoid direct localStorage calls in sync code.

- [ ] **Step 3: Update `ProgressService` for progress union**

Keep script-scoped state, record outcomes immediately, preserve current version when applying local results, and set `updatedAtMs` via the monotonic helper for v2 snapshots.

- [ ] **Step 4: Verify and commit**

```bash
npx nx test web
npx nx test progress-domain
git add .
git commit -m "feat(progress): support v1 and v2 local progress storage"
```

---

## Task 10: Frontend sync coordinator

**Files:**

- Create: `apps/web/src/app/services/progress-sync.service.ts`
- Modify: `apps/web/src/app/services/progress.service.ts`
- Modify: `apps/web/src/app/app.config.ts`
- Modify: `apps/web/src/app/pages/script-shell/script-shell.ts` if active script registration is needed

- [ ] **Step 1: Implement app-wide `ProgressSyncService`**

Responsibilities:

- observe auth/session changes and browser online events;
- sync active script first;
- background-sync all known local script keys after active script;
- no persisted operation queue;
- pull remote, merge with local, save local;
- schedule debounced push only when merged progress differs from remote;
- push current local v2 snapshot;
- save canonical merged progress returned by `PUT`;
- expose subtle status state: syncing, saved, offline, pending, or error/pending.

- [ ] **Step 2: Integrate script-scoped `ProgressService`**

After local outcome save, schedule a debounced sync push if the script has v2 progress and the user is signed in.

- [ ] **Step 3: Add tests**

Cover active-first ordering, background all-known-script sync, push-after-pull only when merged differs from remote, debouncing, API unavailable behavior, and returned merged payload saving.

- [ ] **Step 4: Verify and commit**

```bash
npx nx test web
git add .
git commit -m "feat(web): sync progress snapshots through API"
```

---

## Task 11: Account/sync UI and documentation

**Files:**

- Modify: `apps/web/src/app/ui/page-nav/page-nav.ts`
- Modify: home page only if PageNav layout fallback is needed
- Modify: `README.md`
- Optional: CI config for Nx affected targets

- [ ] **Step 1: Evolve `PageNav`**

Make the shared header carry Back, Home, and a compact account/sync chip. The chip signs in with Google, signs out, and shows subtle status. Keep copy short so it fits mobile.

- [ ] **Step 2: Preserve practice flow**

OAuth sign-in redirects back to the current route. Sign-out keeps local progress and leaves practice usable.

- [ ] **Step 3: Document local development and config**

README should include:

```bash
npm install
npx nx serve api
npx nx serve web
npx nx run-many -t test
npx nx run-many -t build
```

Document:

- frontend public placeholders and real-value injection/override;
- backend env vars;
- Google OAuth redirect URLs;
- user-scoped Supabase access and RLS;
- synced progress JSON stored in Supabase;
- local progress merging into the next signed-in Google account on the same device for MVP;
- backend rate limiting deferred; frontend debounces writes.

- [ ] **Step 4: Manual verification**

Verify:

1. guest practice still uses local storage and works without auth;
2. Google OAuth login works and returns to the current route;
3. browser calls NestJS API, not Supabase table writes directly;
4. RLS prevents cross-user access;
5. device/browser A progress appears on device/browser B after pull/merge;
6. offline practice queues by snapshot and later flushes;
7. sign-out keeps local progress;
8. a second Google account on the same browser receives current device-local progress per MVP behavior.

- [ ] **Step 5: Final checks and commit**

```bash
npx nx run-many -t test
npx nx run-many -t build
git add .
git commit -m "feat(auth): add account sync UI and documentation"
```

---

## Coverage map

| Design decision | Tasks |
| --- | --- |
| Staged Nx migration | 1-2 |
| NestJS API and shared libs | 3 |
| Supabase schema and RLS | 4 |
| Shared script ID validation | 5 |
| Progress merge/migration/contracts | 6 |
| Google OAuth and API client | 7 |
| User-scoped Supabase API | 8 |
| Same-key v1/v2 local storage | 9 |
| Snapshot sync, active-first/all-known catch-up | 10 |
| PageNav account/sync chip and docs | 11 |

## Plan self-review

- Intentional placeholders remain for Supabase project URL, publishable key, JWKS URL, production site URL, preview URLs, and OAuth provider setup. Do not commit real secrets.
- The API plan intentionally does not validate per-letter numeric bounds, matching the approved MVP scope.
- The plan intentionally does not add backend rate limiting, Apple OAuth, service-role normal-path DB access, or a persisted operation queue.
