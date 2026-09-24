export type HintLevel = 0 | 1 | 2;

export interface LetterProgressV1 {
  readonly hintLevel: HintLevel;
  readonly consecutiveCorrect: number;
  readonly wrongAnswers: number;
}

export interface LetterProgressV2 extends LetterProgressV1 {
  readonly updatedAtMs: number;
}

export interface AppProgressV1 {
  readonly version: 1;
  readonly letters: Readonly<Record<string, LetterProgressV1>>;
}

export interface AppProgressV2 {
  readonly version: 2;
  readonly letters: Readonly<Record<string, LetterProgressV2>>;
  readonly completedLessons?: readonly string[];
  readonly xp?: number;
  readonly hearts?: number;
  readonly streakCount?: number;
  readonly lastCompletedDate?: string;
}

export type AppProgress = AppProgressV1 | AppProgressV2;

type MaybeTimestampedLetter = LetterProgressV1 & Partial<Pick<LetterProgressV2, 'updatedAtMs'>>;

export function migrateV1ToV2(progress: AppProgressV1, updatedAtMs: number): AppProgressV2 {
  return {
    version: 2,
    letters: Object.fromEntries(
      Object.entries(progress.letters).map(([key, letter]) => [key, { ...letter, updatedAtMs }]),
    ),
  };
}

export function mergeProgressV2(remote: AppProgressV2 | null | undefined, local: AppProgressV2): AppProgressV2 {
  const letters: Record<string, LetterProgressV2> = {};
  const keys = new Set([...Object.keys(remote?.letters ?? {}), ...Object.keys(local.letters)]);

  for (const key of keys) {
    const remoteLetter = remote?.letters[key] as MaybeTimestampedLetter | undefined;
    const localLetter = local.letters[key] as MaybeTimestampedLetter | undefined;

    letters[key] = chooseLetter(remoteLetter, localLetter) as LetterProgressV2;
  }

  const completedLessons = Array.from(
    new Set([...(remote?.completedLessons ?? []), ...(local.completedLessons ?? [])]),
  );
  const xp = Math.max(remote?.xp ?? 0, local.xp ?? 0);
  const streakCount = Math.max(remote?.streakCount ?? 0, local.streakCount ?? 0);
  const hearts = local.hearts ?? remote?.hearts ?? 5;
  const lastCompletedDate = local.lastCompletedDate ?? remote?.lastCompletedDate;

  return {
    version: 2,
    letters,
    completedLessons,
    xp,
    streakCount,
    hearts,
    ...(lastCompletedDate !== undefined ? { lastCompletedDate } : {}),
  };
}

export function createMonotonicTimestamp(now: () => number = () => Date.now()): () => number {
  let lastIssued = 0;

  return () => {
    const next = Math.max(now(), lastIssued + 1);
    lastIssued = next;
    return next;
  };
}

export function progressV2Equals(left: AppProgressV2 | null | undefined, right: AppProgressV2 | null | undefined): boolean {
  if (!left || !right) {
    return left === right;
  }

  return stableStringify(left) === stableStringify(right);
}

function chooseLetter(
  remoteLetter: MaybeTimestampedLetter | undefined,
  localLetter: MaybeTimestampedLetter | undefined,
): MaybeTimestampedLetter {
  if (!remoteLetter) {
    return localLetter as MaybeTimestampedLetter;
  }
  if (!localLetter) {
    return remoteLetter;
  }

  const remoteTimestamp = remoteLetter.updatedAtMs;
  const localTimestamp = localLetter.updatedAtMs;

  if (typeof remoteTimestamp !== 'number' && typeof localTimestamp !== 'number') {
    return localLetter;
  }
  if (typeof remoteTimestamp !== 'number' || typeof localTimestamp !== 'number') {
    return remoteLetter;
  }
  if (localTimestamp > remoteTimestamp) {
    return localLetter;
  }
  return remoteLetter;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
