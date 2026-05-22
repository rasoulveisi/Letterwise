import type { AppProgress, Exercise } from './models';
import { allLetters, romanHintFor } from './script-helpers';
import type { ScriptDefinition } from './script-types';

export interface BuildSessionOptions {
  readonly random: () => number;
  readonly exerciseCount: number;
}

function pickWeightedWeakLetters(
  def: ScriptDefinition,
  progress: AppProgress,
  limit: number,
): string[] {
  const entries = Object.entries(progress.letters);
  entries.sort((a, b) => b[1].wrongAnswers - a[1].wrongAnswers);
  const keys = entries.map(([k]) => k);
  const pool = keys.length ? keys : allLetters(def);
  return pool.slice(0, limit);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function randomItem<T>(arr: readonly T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)] as T;
}

function buildLetterPick(
  def: ScriptDefinition,
  weak: string[],
  random: () => number,
): Exercise {
  const letters = allLetters(def);
  const target = weak.length ? randomItem(weak, random) : randomItem(letters, random);
  const foils = letters.filter((l) => l !== target);
  const options = shuffle([target, ...shuffle(foils, random).slice(0, 3)], random);
  return {
    kind: 'letter-pick',
    targetLetter: target,
    latinFull: romanHintFor(def, target),
    options,
  };
}

function buildMinimalPair(def: ScriptDefinition, random: () => number): Exercise {
  const pair = randomItem([...def.confusablePairs], random);
  const targetIdx = random() < 0.5 ? 0 : 1;
  const targetLetter = pair.glyphs[targetIdx] ?? pair.glyphs[0];
  return {
    kind: 'minimal-pair',
    pairId: pair.id,
    targetLetter,
    latinFull: pair.latinHints[targetIdx] ?? '',
    glyphs: pair.glyphs,
  };
}

export function buildSessionExercises(
  def: ScriptDefinition,
  progress: AppProgress,
  opts: BuildSessionOptions,
): Exercise[] {
  const { random, exerciseCount } = opts;
  const weak = pickWeightedWeakLetters(def, progress, 6);
  const out: Exercise[] = [];
  for (let i = 0; i < exerciseCount; i++) {
    const mix = i % 3 === 0 ? buildMinimalPair(def, random) : buildLetterPick(def, weak, random);
    out.push(mix);
  }
  return out;
}
