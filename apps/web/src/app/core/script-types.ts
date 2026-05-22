import type { ConfusablePair } from './models';

/** One grapheme + roman / Latin / pinyin scaffold (not a translation). */
export interface AlphabetEntry {
  readonly letter: string;
  readonly latinHint: string;
}

export interface ScriptDefinition {
  readonly id: string;
  readonly name: string;
  readonly nativeLabel: string;
  readonly tagline: string;
  readonly overviewTitle: string;
  readonly overviewSubtitle: string;
  /** Match step wording (language-neutral “glyph”). */
  readonly matchPrompt: string;
  readonly alphabet: readonly AlphabetEntry[];
  readonly confusablePairs: readonly ConfusablePair[];
}
