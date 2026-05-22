export type {
  AppProgress,
  AppProgressV1,
  AppProgressV2,
  HintLevel,
  LetterProgressV1 as LetterProgress,
} from '@letterwise/progress/domain';

export interface ConfusablePair {
  readonly id: string;
  readonly glyphs: readonly [string, string];
  readonly latinHints: readonly [string, string];
}

export interface LetterPickExercise {
  readonly kind: 'letter-pick';
  readonly targetLetter: string;
  readonly latinFull: string;
  readonly options: readonly string[];
}

export interface MinimalPairExercise {
  readonly kind: 'minimal-pair';
  readonly pairId: string;
  readonly targetLetter: string;
  readonly latinFull: string;
  readonly glyphs: readonly [string, string];
}

export type Exercise = LetterPickExercise | MinimalPairExercise;
