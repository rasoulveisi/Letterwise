import { EASTERN_ARMENIAN_ALPHABET } from '../armenian-alphabet';
import type { ScriptDefinition } from '../script-types';

export const HY_SCRIPT: ScriptDefinition = {
  id: 'hy',
  name: 'Armenian',
  nativeLabel: 'Հայերեն',
  tagline: 'Decode letters you see on signs — not a language course.',
  overviewTitle: 'Full Armenian alphabet',
  overviewSubtitle:
    '39 letters in standard order. Roman hints are temporary scaffolds — they fade in practice.',
  matchPrompt: 'Tap the matching letter.',
  alphabet: EASTERN_ARMENIAN_ALPHABET,
  confusablePairs: [
    {
      id: 'eh-e',
      glyphs: ['է', 'ե'],
      latinHints: ['ē (eh)', 'e (closed e)'],
    },
    {
      id: 'i-v',
      glyphs: ['ի', 'վ'],
      latinHints: ['i', 'v'],
    },
    {
      id: 'o-r',
      glyphs: ['ո', 'ռ'],
      latinHints: ['o', 'ṙ'],
    },
    {
      id: 'p-k',
      glyphs: ['պ', 'կ'],
      latinHints: ['p', 'k'],
    },
  ],
};
