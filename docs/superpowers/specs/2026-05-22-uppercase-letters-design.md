# Uppercase Letters Design

## Goal

Add uppercase letter recognition to Letterwise for scripts that have casing: Armenian (`hy`) and Russian (`ru`). Chinese (`zh`) remains unchanged.

## Approach

Represent uppercase letters as their own alphabet entries. For each Armenian and Russian lowercase alphabet entry, generate an uppercase entry with the same Latin hint and place it immediately before its lowercase counterpart.

This keeps the existing app model simple:

- learn overview reads from `ScriptDefinition.alphabet`;
- learn match steps are generated from `allLetters(def)`;
- session exercises are generated from `allLetters(def)`;
- progress remains keyed by exact glyph string, so uppercase and lowercase progress are tracked separately.

## Scope

In scope:

- Armenian alphabet grows from 39 to 78 entries.
- Russian alphabet grows from 33 to 66 entries.
- Chinese alphabet remains unchanged.
- Learn and session generation can include uppercase targets for Armenian and Russian.
- Existing confusable pairs remain lowercase-only for this change.

Out of scope:

- Case toggles or user preferences.
- Special uppercase confusable pair sets.
- Grouped display such as `Ա ա` in one tile.
- Changing progress merge or sync behavior.

## Data Flow

`HY_SCRIPT` will compose uppercase/lowercase entries from the existing Eastern Armenian alphabet data.

`RU_SCRIPT` will compose uppercase/lowercase entries from the current Russian order and hint arrays.

`allLetters(def)` will continue to return `def.alphabet.map((entry) => entry.letter)`, so all existing learn/session generation benefits from the data change without new UI logic.

## Testing

Tests should cover:

- Armenian exposes 78 unique alphabet entries with uppercase before lowercase.
- Russian exposes 66 unique alphabet entries with uppercase before lowercase.
- Chinese remains unchanged.
- `allLetters(HY_SCRIPT)` and `allLetters(RU_SCRIPT)` include uppercase glyphs.
- Session builder can produce an uppercase target when uppercase letters are present.

## Risks

Progress for uppercase and lowercase letters is intentionally separate. That may make practice slightly longer, but it matches the recognition goal and avoids hidden coupling between different glyph forms.
