import { createMonotonicTimestamp, migrateV1ToV2, type AppProgressV1, type AppProgressV2 } from '@letterwise/progress/domain';
import type { AppProgress, HintLevel, LetterProgress } from './models';

export function progressStorageKey(scriptId: string): string {
  return `letterwise-v1-${scriptId}`;
}

export function emptyProgress(): AppProgressV2 {
  return { version: 2, letters: {}, completedLessons: [], xp: 0, hearts: 5, streakCount: 0 } as AppProgressV2;
}

interface ParsedProgressPayload {
  version?: number;
  letters?: Record<string, unknown>;
  completedLessons?: string[];
  xp?: number;
  hearts?: number;
  streakCount?: number;
  lastCompletedDate?: string;
}

export function loadProgress(key: string): AppProgress {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) {
    return emptyProgress();
  }
  try {
    const parsed = JSON.parse(raw) as ParsedProgressPayload;
    if (
      (parsed?.version !== 1 && parsed?.version !== 2) ||
      typeof parsed?.letters !== 'object' ||
      parsed?.letters === null
    ) {
      return emptyProgress();
    }
    return {
      version: parsed.version,
      letters: { ...parsed.letters },
      completedLessons: parsed.completedLessons ?? [],
      xp: parsed.xp ?? 0,
      hearts: parsed.hearts ?? 5,
      streakCount: parsed.streakCount ?? 0,
      lastCompletedDate: parsed.lastCompletedDate,
    } as AppProgress;
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

export function applyLessonCompletion(
  state: AppProgress,
  lessonId: string,
  xpGained = 15,
  heartsRemaining = 5,
): AppProgressV2 {
  const v2 = state.version === 2 ? state : migrateProgressForSync(state);
  const existingCompleted = v2.completedLessons ?? [];
  const completedLessons = existingCompleted.includes(lessonId)
    ? existingCompleted
    : [...existingCompleted, lessonId];
  const xp = (v2.xp ?? 0) + xpGained;
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = v2.lastCompletedDate;
  let streakCount = v2.streakCount ?? 0;
  if (!lastDate) {
    streakCount = 1;
  } else if (lastDate === today) {
    streakCount = Math.max(streakCount, 1);
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streakCount = lastDate === yesterday ? streakCount + 1 : 1;
  }
  return {
    ...v2,
    version: 2,
    completedLessons,
    xp,
    hearts: heartsRemaining,
    streakCount,
    lastCompletedDate: today,
  };
}
