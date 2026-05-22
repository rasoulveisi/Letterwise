import type { ScriptDefinition } from '../script-types';

const RU_ORDER = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

const RU_HINTS: readonly string[] = [
  'a',
  'b',
  'v',
  'g',
  'd',
  'ye / e',
  'yo',
  'zh',
  'z',
  'i',
  'y',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'r',
  's',
  't',
  'u',
  'f',
  'kh',
  'ts',
  'ch',
  'sh',
  'shch',
  'hard sign',
  'y / i',
  'soft sign',
  'e',
  'yu',
  'ya',
];

const alphabet = [...RU_ORDER].map((letter, i) => ({
  letter,
  latinHint: RU_HINTS[i] ?? '',
}));

export const RU_SCRIPT: ScriptDefinition = {
  id: 'ru',
  name: 'Russian',
  nativeLabel: 'Русский',
  tagline: 'Decode Cyrillic you see in the wild — not a grammar course.',
  overviewTitle: 'Russian Cyrillic alphabet',
  overviewSubtitle:
    '33 letters. Roman hints are temporary scaffolds — they fade in practice.',
  matchPrompt: 'Tap the matching letter.',
  alphabet,
  confusablePairs: [
    { id: 'sh-shch', glyphs: ['ш', 'щ'], latinHints: ['sh', 'shch'] },
    { id: 'i-shorty', glyphs: ['и', 'й'], latinHints: ['i', 'short y'] },
    { id: 'e-yo', glyphs: ['е', 'ё'], latinHints: ['ye / e', 'yo'] },
    { id: 'n-p', glyphs: ['н', 'п'], latinHints: ['n', 'p'] },
  ],
};
