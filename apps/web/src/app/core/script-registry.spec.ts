import { describe, expect, it } from 'vitest';
import { ALL_SCRIPTS, getScriptDefinition, isKnownScriptId } from './script-registry';
import { HY_SCRIPT } from './scripts/hy.script';
import { allLetters, getPairById, romanHintFor } from './script-helpers';

describe('script-registry', () => {
  it('includes Armenian, Russian, and Chinese scripts', () => {
    const ids = ALL_SCRIPTS.map((s) => s.id);
    expect(new Set(ids)).toEqual(new Set(['hy', 'ru', 'zh']));
  });

  it('getScriptDefinition returns script or undefined', () => {
    expect(getScriptDefinition('hy')).toEqual(HY_SCRIPT);
    expect(getScriptDefinition('__missing__')).toBeUndefined();
  });

  it('isKnownScriptId', () => {
    expect(isKnownScriptId('hy')).toBe(true);
    expect(isKnownScriptId('xx')).toBe(false);
  });
});

describe('script-helpers with HY_SCRIPT', () => {
  it('confusable pairs have two distinct glyphs', () => {
    for (const p of HY_SCRIPT.confusablePairs) {
      expect(p.glyphs[0]).not.toBe(p.glyphs[1]);
    }
  });

  it('getPairById returns pair or undefined', () => {
    const first = HY_SCRIPT.confusablePairs[0];
    expect(getPairById(HY_SCRIPT, first!.id)).toEqual(first);
    expect(getPairById(HY_SCRIPT, '__missing__')).toBeUndefined();
  });

  it('allLetters returns 39 unique Armenian letters', () => {
    const letters = allLetters(HY_SCRIPT);
    expect(letters.length).toBe(39);
    expect(new Set(letters).size).toBe(39);
  });

  it('romanHintFor returns hint for Armenian glyphs', () => {
    expect(romanHintFor(HY_SCRIPT, 'է').length).toBeGreaterThan(0);
    expect(romanHintFor(HY_SCRIPT, 'և').length).toBeGreaterThan(0);
    expect(romanHintFor(HY_SCRIPT, '?')).toBe('');
  });
});
