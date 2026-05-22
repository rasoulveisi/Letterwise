import { describe, expect, it } from 'vitest';
import { ALL_SCRIPTS, getScriptDefinition, isKnownScriptId } from './script-registry';
import { HY_SCRIPT } from './scripts/hy.script';
import { RU_SCRIPT } from './scripts/ru.script';
import { ZH_SCRIPT } from './scripts/zh.script';
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

  it('allLetters returns uppercase and lowercase Armenian letters', () => {
    const letters = allLetters(HY_SCRIPT);
    expect(letters.length).toBe(78);
    expect(new Set(letters).size).toBe(78);
    expect(letters.slice(0, 4)).toEqual(['Ա', 'ա', 'Բ', 'բ']);
  });

  it('romanHintFor returns hint for Armenian glyphs', () => {
    expect(romanHintFor(HY_SCRIPT, 'Ա')).toBe(romanHintFor(HY_SCRIPT, 'ա'));
    expect(romanHintFor(HY_SCRIPT, 'է').length).toBeGreaterThan(0);
    expect(romanHintFor(HY_SCRIPT, 'և').length).toBeGreaterThan(0);
    expect(romanHintFor(HY_SCRIPT, '?')).toBe('');
  });
});

describe('script-helpers with RU_SCRIPT', () => {
  it('allLetters returns uppercase and lowercase Russian letters', () => {
    const letters = allLetters(RU_SCRIPT);
    expect(letters.length).toBe(66);
    expect(new Set(letters).size).toBe(66);
    expect(letters.slice(0, 4)).toEqual(['А', 'а', 'Б', 'б']);
  });

  it('romanHintFor returns the same hint for Russian uppercase and lowercase glyphs', () => {
    expect(romanHintFor(RU_SCRIPT, 'А')).toBe(romanHintFor(RU_SCRIPT, 'а'));
  });
});

describe('script-helpers with ZH_SCRIPT', () => {
  it('keeps Chinese unchanged', () => {
    expect(allLetters(ZH_SCRIPT).length).toBe(41);
  });
});
