import type { HintLevel } from './models';

const MAX_LEVEL: HintLevel = 2;

export function latinScaffoldForHint(
  _letter: string,
  level: HintLevel,
  fullLatin: string,
): string {
  if (level >= 2) {
    return fullLatin;
  }
  if (level === 1) {
    const trimmed = fullLatin.trim();
    if (!trimmed) {
      return '';
    }
    const first = trimmed.codePointAt(0);
    if (first === undefined) {
      return '';
    }
    const firstChar = String.fromCodePoint(first);
    return `${firstChar}…`;
  }
  return '';
}

export function nextHintLevelAfterResult(
  currentLevel: HintLevel,
  correct: boolean,
  newStreak: number,
): HintLevel {
  if (!correct) {
    return (Math.min(MAX_LEVEL, currentLevel + 1) as HintLevel);
  }
  if (newStreak < 3) {
    return currentLevel;
  }
  return (Math.max(0, currentLevel - 1) as HintLevel);
}
