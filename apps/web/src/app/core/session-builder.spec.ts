import { describe, expect, it } from 'vitest';
import { buildSessionExercises } from './session-builder';
import { emptyProgress } from './progress-storage';
import { HY_SCRIPT } from './scripts/hy.script';

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

describe('session-builder', () => {
  it('returns requested length', () => {
    const exercises = buildSessionExercises(HY_SCRIPT, emptyProgress(), {
      random: rng(42),
      exerciseCount: 8,
    });
    expect(exercises.length).toBe(8);
  });

  it('letter-pick exercises have four unique options including target', () => {
    const exercises = buildSessionExercises(HY_SCRIPT, emptyProgress(), {
      random: rng(1),
      exerciseCount: 10,
    });
    for (const ex of exercises) {
      if (ex.kind === 'letter-pick') {
        expect(ex.options.length).toBe(4);
        expect(new Set(ex.options).size).toBe(4);
        expect(ex.options.includes(ex.targetLetter)).toBe(true);
      }
    }
  });

  it('minimal-pair exercises reference known pair id', () => {
    const exercises = buildSessionExercises(HY_SCRIPT, emptyProgress(), {
      random: rng(2),
      exerciseCount: 9,
    });
    for (const ex of exercises) {
      if (ex.kind === 'minimal-pair') {
        expect(ex.glyphs[0]).not.toBe(ex.glyphs[1]);
        expect([ex.glyphs[0], ex.glyphs[1]].includes(ex.targetLetter)).toBe(true);
      }
    }
  });
});
