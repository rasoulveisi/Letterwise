import type { ConfusablePair } from './models';
import type { ScriptDefinition } from './script-types';

export function allLetters(def: ScriptDefinition): string[] {
  return def.alphabet.map((e) => e.letter);
}

export function romanHintFor(def: ScriptDefinition, letter: string): string {
  return def.alphabet.find((e) => e.letter === letter)?.latinHint ?? '';
}

export function getPairById(def: ScriptDefinition, id: string): ConfusablePair | undefined {
  return def.confusablePairs.find((p) => p.id === id);
}
