import { createMonotonicTimestamp, migrateV1ToV2, type AppProgressV1, type AppProgressV2 } from '@letterwise/progress/domain';
import type { AppProgress, HintLevel, LetterProgress } from './models';

export function progressStorageKey(scriptId: string): string {
  return `letterwise-v1-${scriptId}`;
}

export function emptyProgress(): AppProgress {
  return { version: 1, letters: {} };
}

export function loadProgress(key: string): AppProgress {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) {
    return emptyProgress();
  }
  try {
    const parsed = JSON.parse(raw) as AppProgress;
    if (
      (parsed?.version !== 1 && parsed?.version !== 2) ||
      typeof parsed.letters !== 'object' ||
      parsed.letters === null
    ) {
      return emptyProgress();
    }
    return { version: parsed.version, letters: { ...parsed.letters } } as AppProgress;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(key: string, state: AppProgress): void {
  globalThis.localStorage?.setItem(key, JSON.stringify(state));
}

export interface LetterOutcomeInput {
  correct: boolean;
  nextStreak: number;
  nextHintLevel: HintLevel;
  updatedAtMs?: number;
}

export function applyLetterResult(
  state: AppProgress,
  letterKey: string,
  outcome: LetterOutcomeInput,
): AppProgress {
  const prev: LetterProgress = state.letters[letterKey] ?? {
    hintLevel: 2,
    consecutiveCorrect: 0,
    wrongAnswers: 0,
  };

  const wrongAnswers = outcome.correct ? prev.wrongAnswers : prev.wrongAnswers + 1;

  const nextLetter: LetterProgress & { updatedAtMs?: number } = {
    hintLevel: outcome.nextHintLevel,
    consecutiveCorrect: outcome.nextStreak,
    wrongAnswers,
  };
  if (state.version === 2) {
    nextLetter.updatedAtMs = outcome.updatedAtMs ?? Date.now();
  }

  return {
    version: state.version,
    letters: { ...state.letters, [letterKey]: nextLetter },
  } as AppProgress;
}

export function migrateProgressForSync(state: AppProgress, updatedAtMs = Date.now()): AppProgressV2 {
  return state.version === 2 ? state : migrateV1ToV2(state as AppProgressV1, updatedAtMs);
}

export const nextProgressTimestamp = createMonotonicTimestamp();
