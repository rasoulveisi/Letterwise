import type { LearnStep } from './learn-step-types';
import { allLetters, romanHintFor } from './script-helpers';
import type { ScriptDefinition } from './script-types';

export type { LearnStep } from './learn-step-types';

/**
 * Deterministic PRNG keyed by script so learn steps (including shuffled options) stay stable
 * across URL navigations and refresh.
 */
export function learnSequenceRng(scriptId: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < scriptId.length; i++) {
    h ^= scriptId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Learning path: full script grid → confusable pairs → one guided match per grapheme.
 */
export function buildLearnSteps(def: ScriptDefinition, random: () => number): LearnStep[] {
  const steps: LearnStep[] = [{ kind: 'alphabet-overview' }];
  for (const p of def.confusablePairs) {
    steps.push({
      kind: 'pair-intro',
      pairId: p.id,
      glyphs: p.glyphs,
      latinHints: p.latinHints,
    });
  }
  const letters = allLetters(def);
  for (const letter of letters) {
    const foils = letters.filter((l) => l !== letter);
    const options = shuffle(
      [letter, ...shuffle(foils, random).slice(0, 3)],
      random,
    ) as string[];
    steps.push({
      kind: 'match-letter',
      targetLetter: letter,
      latinFull: romanHintFor(def, letter),
      options,
    });
  }
  return steps;
}
