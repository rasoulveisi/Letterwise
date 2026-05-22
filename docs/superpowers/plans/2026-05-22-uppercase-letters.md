# Uppercase Letters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add uppercase recognition entries for Armenian and Russian while leaving Chinese unchanged.

**Architecture:** Keep uppercase support data-driven. Armenian and Russian script definitions expose uppercase and lowercase glyphs as separate alphabet entries; existing learn/session/progress code continues to consume `ScriptDefinition.alphabet` without new UI state.

**Tech Stack:** Angular 21, TypeScript, Vitest, Nx.

---

### Task 1: Add Failing Coverage For Uppercase Alphabets

**Files:**

- Modify: `apps/web/src/app/core/script-registry.spec.ts`
- Modify: `apps/web/src/app/core/session-builder.spec.ts`

- [ ] **Step 1: Write failing script-registry tests**

Add tests asserting:

```ts
expect(allLetters(HY_SCRIPT).length).toBe(78);
expect(allLetters(HY_SCRIPT).slice(0, 4)).toEqual(['Ա', 'ա', 'Բ', 'բ']);
expect(romanHintFor(HY_SCRIPT, 'Ա')).toBe(romanHintFor(HY_SCRIPT, 'ա'));
expect(allLetters(RU_SCRIPT).length).toBe(66);
expect(allLetters(RU_SCRIPT).slice(0, 4)).toEqual(['А', 'а', 'Б', 'б']);
expect(romanHintFor(RU_SCRIPT, 'А')).toBe(romanHintFor(RU_SCRIPT, 'а'));
expect(allLetters(ZH_SCRIPT).length).toBe(41);
```

- [ ] **Step 2: Write failing session-builder test**

Add a deterministic random test proving a letter-pick exercise can target an uppercase Armenian glyph when uppercase letters are present.

- [ ] **Step 3: Run red tests**

Run:

```bash
npx nx test web --skip-nx-cache
```

Expected: failures showing Armenian has 39 entries, Russian has 33 entries, and no uppercase target appears.

### Task 2: Implement Uppercase Alphabet Expansion

**Files:**

- Modify: `apps/web/src/app/core/armenian-alphabet.ts`
- Modify: `apps/web/src/app/core/scripts/ru.script.ts`

- [ ] **Step 1: Add uppercase/lowercase expansion helper locally in Armenian alphabet**

Build `EASTERN_ARMENIAN_ALPHABET` by flat-mapping each lowercase entry to `[uppercase, lowercase]`, using the same Latin hint for both.

- [ ] **Step 2: Add uppercase/lowercase expansion in Russian script**

Build `alphabet` by flat-mapping each lowercase Cyrillic letter to `[uppercase, lowercase]`, using the same Latin hint for both.

- [ ] **Step 3: Run green tests**

Run:

```bash
npx nx test web --skip-nx-cache
```

Expected: all web tests pass.

### Task 3: Verify Builds

**Files:**

- No new files.

- [ ] **Step 1: Build web**

Run:

```bash
npx nx build web
```

Expected: build passes.

- [ ] **Step 2: Final review**

Confirm Chinese data is unchanged, confusable pairs remain lowercase-only, and progress keys remain exact glyph strings.
