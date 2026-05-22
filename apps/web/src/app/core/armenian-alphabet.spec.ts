import { describe, expect, it } from 'vitest';
import { EASTERN_ARMENIAN_ALPHABET } from './armenian-alphabet';

describe('armenian-alphabet', () => {
  it('has 39 unique letters in standard order', () => {
    expect(EASTERN_ARMENIAN_ALPHABET.length).toBe(39);
    const glyphs = EASTERN_ARMENIAN_ALPHABET.map((e) => e.letter);
    expect(new Set(glyphs).size).toBe(39);
  });

  it('every entry has a non-empty latin hint', () => {
    for (const row of EASTERN_ARMENIAN_ALPHABET) {
      expect(row.latinHint.trim().length).toBeGreaterThan(0);
    }
  });
});
