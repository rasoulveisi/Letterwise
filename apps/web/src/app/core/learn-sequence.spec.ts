import { describe, expect, it } from 'vitest';
import { buildLearnSteps, learnSequenceRng } from './learn-sequence';
import { allLetters } from './script-helpers';
import { HY_SCRIPT } from './scripts/hy.script';

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

describe('learn-sequence', () => {
  it('learnSequenceRng yields stable shuffles for the same script id', () => {
    const a = buildLearnSteps(HY_SCRIPT, learnSequenceRng('hy'));
    const b = buildLearnSteps(HY_SCRIPT, learnSequenceRng('hy'));
    expect(a).toEqual(b);
  });

  it('starts with alphabet overview then pair-intro for each pair', () => {
    const steps = buildLearnSteps(HY_SCRIPT, rng(1));
    expect(steps[0]?.kind).toBe('alphabet-overview');
    const intros = steps.filter((s) => s.kind === 'pair-intro');
    expect(intros.length).toBe(HY_SCRIPT.confusablePairs.length);
    for (let i = 0; i < HY_SCRIPT.confusablePairs.length; i++) {
      expect(intros[i]?.pairId).toBe(HY_SCRIPT.confusablePairs[i]?.id);
    }
  });

  it('ends with match-letter steps that have four unique options', () => {
    const steps = buildLearnSteps(HY_SCRIPT, rng(2));
    const matches = steps.filter((s) => s.kind === 'match-letter');
    expect(matches.length).toBe(allLetters(HY_SCRIPT).length);
    for (const m of matches) {
      expect(m.options.length).toBe(4);
      expect(new Set(m.options).size).toBe(4);
      expect(m.options.includes(m.targetLetter)).toBe(true);
    }
  });
});
