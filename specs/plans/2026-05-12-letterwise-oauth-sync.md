# Letterwise OAuth + Supabase sync — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement OAuth sign-in (Google/Apple via Supabase), persist merged `AppProgress` v2 per user and script in Postgres with RLS, and sync from the Angular client while preserving offline-first UX per `specs/2026-05-12-letterwise-oauth-sync-design.md`.

**Architecture:** Supabase Auth + `@supabase/supabase-js` in an `AuthService`; local-first `ProgressService` extended with sync hooks or a sibling `ProgressRemoteSyncService` that upserts JSON and merges pulls using pure merge helpers; guests unchanged on v1 storage keys.

**Tech stack:** Angular 21, Vitest, `@supabase/supabase-js`, Supabase Postgres (SQL migrations run in Supabase SQL editor or CLI).

---

**Note:** The repository ignores `/docs/` (see `.gitignore`). The approved design lives at `specs/2026-05-12-letterwise-oauth-sync-design.md`. Default `docs/superpowers/` paths from skills are mirrored here under `specs/`.

## File map (created or modified)

| Path | Role |
|------|------|
| `specs/supabase/001_user_script_progress.sql` | Idempotent SQL for table, indexes, RLS, `updated_at` trigger (run in Supabase). |
| `src/environments/environment.ts` | Dev placeholders for `supabaseUrl`, `supabaseAnonKey`. |
| `src/environments/environment.prod.ts` | Production placeholders (filled at deploy). |
| `angular.json` | `fileReplacements` for production build to swap environment file. |
| `src/app/services/supabase-browser.factory.ts` | Creates Supabase client only in browser (`isPlatformBrowser`). |
| `src/app/services/auth.service.ts` | Session, OAuth sign-in/out, signals. |
| `src/app/core/models.ts` | `AppProgress` v2 + `LetterProgress` with `updatedAtMs`. |
| `src/app/core/progress-merge.ts` | Pure merge + migration helpers. |
| `src/app/core/progress-merge.spec.ts` | Vitest tests for merge/migration. |
| `src/app/core/progress-storage.ts` | Load/save v1 and v2; migration path; same storage keys or versioned keys per spec decision. |
| `src/app/services/progress.service.ts` | Integrate sync triggers after local save when signed in. |
| `src/app/services/progress-remote-sync.service.ts` | Fetch/upsert Supabase table; queue retries; subscribe to online/auth. |
| `src/app/app.config.ts` | Provide `AuthService`, sync service, Supabase factory if needed. |
| `src/app/pages/script-shell/script-shell.ts` | Ensure providers include new services (or lift to `app.config`). |
| `src/app/pages/home/` or `src/app/ui/page-nav/` | Minimal Sign in / Sign out / avatar placeholder. |
| `README.md` | Env vars, Supabase redirect URLs, privacy note for synced data. |

---

### Task 1: Database schema and RLS (Supabase project)

**Files:**
- Create: `specs/supabase/001_user_script_progress.sql`

- [ ] **Step 1: Add SQL migration file**

Create `specs/supabase/001_user_script_progress.sql` with:

```sql
-- Run in Supabase SQL editor (or supabase db push). Adjust schema name if you use a non-public migration workflow.

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
  using (auth.uid() = user_id);

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

- [ ] **Step 2: Apply in Supabase**

In the Supabase dashboard for your project: SQL → paste → Run. Confirm table appears under Table Editor.

- [ ] **Step 3: Configure Auth URLs**

Authentication → URL configuration: add `http://localhost:4200` and production site URL to redirect allow list. Enable Google (and Apple if desired) OAuth per Supabase docs.

- [ ] **Step 4: Commit**

```bash
git add specs/supabase/001_user_script_progress.sql
git commit -m "chore: add Supabase schema for user_script_progress"
```

---

### Task 2: Angular environments and Supabase dependency

**Files:**
- Modify: `package.json` (dependency)
- Create: `src/environments/environment.ts`
- Create: `src/environments/environment.prod.ts`
- Modify: `angular.json` (`fileReplacements`)
- Modify: `tsconfig.app.json` if path mapping needed (usually not)

- [ ] **Step 1: Install client library**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npm install @supabase/supabase-js
```

Expected: `package.json` and `package-lock.json` update without errors.

- [ ] **Step 2: Add environment files**

`src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
};
```

`src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
};
```

Replace placeholders with values from Supabase Project Settings → API (never commit real keys if this repo is public; use CI secrets or local-only overrides).

- [ ] **Step 3: Wire production replacement**

In `angular.json`, under `projects.letterwise.architect.build.configurations.production.options`, add:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

(Adjust path if your CLI nests options differently — validate with `ng build`.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/environments/environment.ts src/environments/environment.prod.ts angular.json
git commit -m "feat: add Supabase client dependency and environment files"
```

---

### Task 3: Pure merge and migration (TDD)

**Files:**
- Create: `src/app/core/progress-merge.ts`
- Create: `src/app/core/progress-merge.spec.ts`

- [ ] **Step 1: Write failing tests**

`src/app/core/progress-merge.spec.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { mergeProgressV2, migrateV1ToV2 } from './progress-merge';
import type { AppProgress } from './models';

describe('mergeProgressV2', () => {
  it('chooses higher updatedAtMs per letter', () => {
    const a: AppProgress = {
      version: 2,
      letters: {
        x: {
          hintLevel: 2,
          consecutiveCorrect: 1,
          wrongAnswers: 0,
          updatedAtMs: 100,
        },
      },
    };
    const b: AppProgress = {
      version: 2,
      letters: {
        x: {
          hintLevel: 1,
          consecutiveCorrect: 3,
          wrongAnswers: 2,
          updatedAtMs: 50,
        },
      },
    };
    const out = mergeProgressV2(a, b);
    expect(out.letters.x?.hintLevel).toBe(2);
    expect(out.letters.x?.updatedAtMs).toBe(100);
  });

  it('prefers remote on timestamp tie', () => {
    const local: AppProgress = {
      version: 2,
      letters: {
        x: {
          hintLevel: 2,
          consecutiveCorrect: 0,
          wrongAnswers: 0,
          updatedAtMs: 10,
        },
      },
    };
    const remote: AppProgress = {
      version: 2,
      letters: {
        x: {
          hintLevel: 1,
          consecutiveCorrect: 5,
          wrongAnswers: 1,
          updatedAtMs: 10,
        },
      },
    };
    const out = mergeProgressV2(local, remote, { tiePreferRemote: true });
    expect(out.letters.x?.consecutiveCorrect).toBe(5);
  });
});

describe('migrateV1ToV2', () => {
  it('adds updatedAtMs using fixed clock', () => {
    const v1 = {
      version: 1 as const,
      letters: {
        a: { hintLevel: 2 as const, consecutiveCorrect: 1, wrongAnswers: 0 },
      },
    };
    const out = migrateV1ToV2(v1, () => 42);
    expect(out.version).toBe(2);
    expect(out.letters.a?.updatedAtMs).toBe(42);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --watch=false
```

Expected: FAIL — missing module `./progress-merge`.

- [ ] **Step 3: Extend models**

In `src/app/core/models.ts`, add `updatedAtMs?: number` to `LetterProgress` only if v2 needs it without breaking v1 reads — prefer discriminated `AppProgress` union:

```typescript
export interface LetterProgressV1 {
  readonly hintLevel: HintLevel;
  readonly consecutiveCorrect: number;
  readonly wrongAnswers: number;
}

export interface LetterProgressV2 extends LetterProgressV1 {
  readonly updatedAtMs: number;
}

export type AppProgress =
  | { readonly version: 1; readonly letters: Readonly<Record<string, LetterProgressV1>> }
  | { readonly version: 2; readonly letters: Readonly<Record<string, LetterProgressV2>> };
```

Update all existing references (`applyLetterResult`, components) to accept the union or narrow to v1 until Task 4 migrates storage — compile errors guide fixes.

- [ ] **Step 4: Implement merge and migration**

`src/app/core/progress-merge.ts` implements `mergeProgressV2` per spec tie-breaks and `migrateV1ToV2(v1, nowMs)`.

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- --watch=false
```

- [ ] **Step 6: Commit**

```bash
git add src/app/core/models.ts src/app/core/progress-merge.ts src/app/core/progress-merge.spec.ts
git commit -m "feat(progress): add v2 merge helpers and tests"
```

---

### Task 4: Storage layer supports v1/v2 and migration

**Files:**
- Modify: `src/app/core/progress-storage.ts`
- Modify: `src/app/core/progress-storage.spec.ts` (create if missing — add tests mirroring merge coverage)

- [ ] **Step 1: Write failing tests** for `loadProgress` accepting v1 and v2 JSON shapes and returning typed union; `saveProgress` writes canonical JSON.

- [ ] **Step 2: Implement** `loadProgress` validation branches (`version === 1` vs `2`), `migrateV1ToV2` on first signed-in save if reading legacy local data.

- [ ] **Step 3: Run `npm test -- --watch=false`** until green.

- [ ] **Step 4: Commit**

```bash
git add src/app/core/progress-storage.ts src/app/core/progress-storage.spec.ts
git commit -m "feat(progress): persist AppProgress v1/v2 in localStorage"
```

---

### Task 5: AuthService + browser-only Supabase client

**Files:**
- Create: `src/app/services/supabase-browser.factory.ts`
- Create: `src/app/services/auth.service.ts`

- [ ] **Step 1: Factory**

```typescript
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export function createSupabaseBrowserClient(platformId: object): SupabaseClient | null {
  if (!isPlatformBrowser(platformId)) {
    return null;
  }
  return createClient(environment.supabaseUrl, environment.supabaseAnonKey);
}
```

Injectable wrapper optional; `AuthService` can `inject(PLATFORM_ID)` and call factory.

- [ ] **Step 2: AuthService** exposes:

- `readonly session = signal<Session | null>(null)`
- `readonly user = computed(() => session()?.user ?? null)`
- Constructor: `client.auth.getSession()` then `onAuthStateChange` to update signal (only if client non-null).

Methods: `signInWithGoogle()`, `signOut()` delegating to `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })` etc.

- [ ] **Step 3: Provide in `app.config.ts`**

```typescript
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    AuthService,
  ],
};
```

- [ ] **Step 4: Commit**

```bash
git add src/app/services/supabase-browser.factory.ts src/app/services/auth.service.ts src/app/app.config.ts
git commit -m "feat(auth): add Supabase OAuth-ready AuthService"
```

---

### Task 6: Remote sync service + ProgressService integration

**Files:**
- Create: `src/app/services/progress-remote-sync.service.ts`
- Modify: `src/app/services/progress.service.ts`
- Modify: `src/app/pages/script-shell/script-shell.ts` or `app.config.ts` for providers

- [ ] **Step 1: ProgressRemoteSyncService** responsibilities:

- Inject AuthService, Supabase client (or AuthService-only), PlatformId.
- `pullAndMerge(scriptId: string): Promise<void>` — `select` row for `(user_id, script_id)`; merge with `mergeProgressV2`; write via `saveProgress`.
- `push(scriptId: string, state: AppProgress): Promise<void>` — `upsert` on conflict `(user_id, script_id)`.
- Subscribe to `window.online` and auth session changes to flush queue.

Use `@supabase/supabase-js` `.from('user_script_progress').upsert({ ... })` with `onConflict: 'user_id,script_id'` if supported, else manual select-then-update.

- [ ] **Step 2: ProgressService** after `recordLetterOutcome`:

If `auth.user()` present and `AppProgress` is v2, call `progressRemoteSync.schedulePush(scriptId)` (debounced).

On script change effect: if signed in, call `pullAndMerge`.

- [ ] **Step 3: Unit-test merge integration** remains in `progress-merge`; optional mock Supabase not required for first merge.

- [ ] **Step 4: Commit**

```bash
git add src/app/services/progress-remote-sync.service.ts src/app/services/progress.service.ts src/app/pages/script-shell/script-shell.ts
git commit -m "feat(sync): upsert and merge progress with Supabase"
```

---

### Task 7: Minimal UI + README

**Files:**
- Modify: `src/app/pages/home/home.ts` + template or `src/app/ui/page-nav/`
- Modify: `README.md`

- [ ] **Step 1: Add Sign in / Sign out** buttons calling `AuthService`. Show email or “Signed in” when session exists.

- [ ] **Step 2: Document** env vars, redirect URLs, and that sync stores JSON in Supabase.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/home/home.ts README.md
git commit -m "feat(auth): basic OAuth controls and sync documentation"
```

---

## Plan self-review (spec coverage)

| Spec section | Tasks |
|----------------|-------|
| Supabase table + RLS | Task 1 |
| OAuth + session | Task 2, 5, 7 |
| Local-first + queue | Task 6 |
| Merge policy | Task 3 |
| v2 progress + migration | Task 3–4 |
| Testing | Task 3–4 |
| README / privacy | Task 7 |

Placeholder scan: none intentional; engineers replace Supabase URL/key and OAuth providers in dashboard.

---

**Plan complete and saved to `specs/plans/2026-05-12-letterwise-oauth-sync.md`. Two execution options:**

**1. Subagent-driven (recommended)** — Dispatch a fresh subagent per task, review between tasks.

**2. Inline execution** — Execute tasks in this session using executing-plans with checkpoints.

**Which approach do you want?**
