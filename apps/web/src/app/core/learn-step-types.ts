export type LearnStep =
  | { readonly kind: 'alphabet-overview' }
  | {
      readonly kind: 'pair-intro';
      readonly pairId: string;
      readonly glyphs: readonly [string, string];
      readonly latinHints: readonly [string, string];
    }
  | {
      readonly kind: 'match-letter';
      readonly targetLetter: string;
      readonly latinFull: string;
      readonly options: readonly string[];
    };
