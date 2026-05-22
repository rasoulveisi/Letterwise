/**
 * Eastern Armenian alphabet in standard order (39 letters, including և).
 * Roman hints are short pronunciation scaffolds for readers — not a language course.
 */
import type { AlphabetEntry } from './script-types';

const LATIN_HINTS = [
  'a',
  'b',
  'g',
  'd',
  'e / ye',
  'z',
  'ē (eh)',
  'ə (uh)',
  't’',
  'zh',
  'i',
  'l',
  'kh',
  'ts',
  'k',
  'h',
  'dz',
  'ł / gh',
  'ch',
  'm',
  'y',
  'n',
  'sh',
  'o',
  'ch’',
  'p',
  'j',
  'ṙ',
  's',
  'v',
  't',
  'r',
  'ts’',
  'w / v',
  'p’',
  'k’',
  'o (open)',
  'f',
  'ev',
] as const;

const ORDER = 'աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆև';

function buildAlphabet(): readonly AlphabetEntry[] {
  const letters = [...ORDER];
  if (letters.length !== LATIN_HINTS.length) {
    throw new Error(
      `Alphabet length mismatch: ${letters.length} letters vs ${LATIN_HINTS.length} hints`,
    );
  }
  return letters.map((letter, i) => ({
    letter,
    latinHint: LATIN_HINTS[i] ?? '',
  }));
}

export const EASTERN_ARMENIAN_ALPHABET: readonly AlphabetEntry[] = buildAlphabet();
