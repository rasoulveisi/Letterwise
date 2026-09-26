export type ScriptId = 'hy' | 'ru' | 'zh';

export interface ScriptMetadata {
  readonly id: ScriptId;
  readonly name: string;
  readonly nativeLabel: string;
  readonly tagline: string;
}

export const ALL_SCRIPT_METADATA = [
  {
    id: 'hy',
    name: 'Armenian',
    nativeLabel: 'Հայերեն',
    tagline: 'Learn the Armenian alphabet.',
  },
  {
    id: 'ru',
    name: 'Russian',
    nativeLabel: 'Русский',
    tagline: 'Learn the Russian alphabet.',
  },
  {
    id: 'zh',
    name: 'Chinese',
    nativeLabel: '中文',
    tagline: 'Learn core Chinese characters.',
  },
] as const satisfies readonly ScriptMetadata[];

export const KNOWN_SCRIPT_IDS = ALL_SCRIPT_METADATA.map((script) => script.id) as readonly ScriptId[];

export function isKnownScriptId(id: string): id is ScriptId {
  return (KNOWN_SCRIPT_IDS as readonly string[]).includes(id);
}

export type ExerciseType = 'LETTER_PAIR' | 'PHONETIC_SELECT' | 'DECODE_COGNATE' | 'WORD_BUILDER';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
}

export interface LetterPairExercise extends BaseExercise {
  type: 'LETTER_PAIR';
  target: string;
  options: readonly string[];
  correctAnswer: string;
}

export interface PhoneticSelectExercise extends BaseExercise {
  type: 'PHONETIC_SELECT';
  soundHint: string;
  options: readonly string[];
  correctAnswer: string;
}

export interface DecodeCognateExercise extends BaseExercise {
  type: 'DECODE_COGNATE';
  targetWord: string;
  pronunciation?: string;
  options: readonly string[];
  correctAnswer: string;
}

export interface WordBuilderExercise extends BaseExercise {
  type: 'WORD_BUILDER';
  targetWord: string;
  translation?: string;
  tokens: readonly string[];
  correctAnswer: readonly string[];
}

export type CurriculumExercise =
  | LetterPairExercise
  | PhoneticSelectExercise
  | DecodeCognateExercise
  | WordBuilderExercise;

export interface CurriculumLesson {
  id: string;
  unitId: string;
  title: string;
  orderIndex: number;
  exercises: readonly CurriculumExercise[];
}

export interface CurriculumUnit {
  id: string;
  scriptId: ScriptId;
  title: string;
  description: string;
  orderIndex: number;
  lessons: readonly CurriculumLesson[];
}

export const ARMENIAN_CURRICULUM: readonly CurriculumUnit[] = [
  {
    id: 'hy-u1',
    scriptId: 'hy',
    title: 'First Words & Vowels',
    description: 'Master foundational vowels and consonants to read your first words.',
    orderIndex: 1,
    lessons: [
      {
        id: 'hy-u1-l1',
        unitId: 'hy-u1',
        title: 'Vowels: Ա, Ե, Ի',
        orderIndex: 1,
        exercises: [
          {
            id: 'ex-1',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ա',
            options: ['ա', 'ե', 'ի', 'տ'],
            correctAnswer: 'ա',
          },
          {
            id: 'ex-2',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ե',
            options: ['ե', 'ա', 'ի', 'ն'],
            correctAnswer: 'ե',
          },
          {
            id: 'ex-3',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ի',
            options: ['ի', 'ե', 'ս', 'ա'],
            correctAnswer: 'ի',
          },
          {
            id: 'ex-4',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "a"?',
            soundHint: 'a',
            options: ['Ա', 'Ե', 'Ի', 'Ս'],
            correctAnswer: 'Ա',
          },
          {
            id: 'ex-5',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "e" / "ye"?',
            soundHint: 'e / ye',
            options: ['Ե', 'Ա', 'Ի', 'Տ'],
            correctAnswer: 'Ե',
          },
          {
            id: 'ex-6',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "i"?',
            soundHint: 'i',
            options: ['Ի', 'Ե', 'Ա', 'Ն'],
            correctAnswer: 'Ի',
          },
        ],
      },
      {
        id: 'hy-u1-l2',
        unitId: 'hy-u1',
        title: 'Consonants: Ս, Տ, Ն',
        orderIndex: 2,
        exercises: [
          {
            id: 'ex-7',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ս',
            options: ['ս', 'տ', 'ն', 'ա'],
            correctAnswer: 'ս',
          },
          {
            id: 'ex-8',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Տ',
            options: ['տ', 'ս', 'ն', 'ե'],
            correctAnswer: 'տ',
          },
          {
            id: 'ex-9',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ն',
            options: ['ն', 'տ', 'ս', 'ի'],
            correctAnswer: 'ն',
          },
          {
            id: 'ex-10',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "s"?',
            soundHint: 's',
            options: ['Ս', 'Տ', 'Ն', 'Ա'],
            correctAnswer: 'Ս',
          },
          {
            id: 'ex-11',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "t"?',
            soundHint: 't',
            options: ['Տ', 'Ս', 'Ն', 'Ե'],
            correctAnswer: 'Տ',
          },
          {
            id: 'ex-12',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "n"?',
            soundHint: 'n',
            options: ['Ն', 'Տ', 'Ս', 'Ի'],
            correctAnswer: 'Ն',
          },
        ],
      },
      {
        id: 'hy-u1-l3',
        unitId: 'hy-u1',
        title: 'First Words: ես, նա, սա',
        orderIndex: 3,
        exercises: [
          {
            id: 'ex-13',
            type: 'DECODE_COGNATE',
            prompt: 'What does this word mean?',
            targetWord: 'ես',
            pronunciation: 'yes',
            options: ['I', 'you', 'he / she', 'this'],
            correctAnswer: 'I',
          },
          {
            id: 'ex-14',
            type: 'WORD_BUILDER',
            prompt: 'Spell "I" in Armenian',
            targetWord: 'ես',
            translation: 'I',
            tokens: ['ս', 'ե', 'ա', 'տ'],
            correctAnswer: ['ե', 'ս'],
          },
          {
            id: 'ex-15',
            type: 'DECODE_COGNATE',
            prompt: 'What does this word mean?',
            targetWord: 'նա',
            pronunciation: 'na',
            options: ['he / she', 'I', 'this', 'we'],
            correctAnswer: 'he / she',
          },
          {
            id: 'ex-16',
            type: 'WORD_BUILDER',
            prompt: 'Spell "he / she" in Armenian',
            targetWord: 'նա',
            translation: 'he / she',
            tokens: ['ն', 'ա', 'ե', 'ս'],
            correctAnswer: ['ն', 'ա'],
          },
          {
            id: 'ex-17',
            type: 'DECODE_COGNATE',
            prompt: 'What does this word mean?',
            targetWord: 'սա',
            pronunciation: 'sa',
            options: ['this', 'I', 'he / she', 'that'],
            correctAnswer: 'this',
          },
          {
            id: 'ex-18',
            type: 'WORD_BUILDER',
            prompt: 'Spell "this" in Armenian',
            targetWord: 'սա',
            translation: 'this',
            tokens: ['ս', 'ա', 'տ', 'ի'],
            correctAnswer: ['ս', 'ա'],
          },
        ],
      },
    ],
  },
  {
    id: 'hy-u2',
    scriptId: 'hy',
    title: 'Identity & Basic Verbs',
    description:
      'Introduce Է է, Մ մ, Կ կ, Ր ր and Լ լ through short identity phrases. Read Ես as yes but եմ as em. Digraph ու is one reading tile.',
    orderIndex: 2,
    lessons: [
      {
        id: 'lesson-u2-l1',
        unitId: 'hy-u2',
        title: 'Meet Է է and Մ մ: Ես եմ',
        orderIndex: 1,
        exercises: [
          {
            id: 'ex-u2-l1-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Է է. Match uppercase and lowercase',
            target: 'Է',
            options: ['ե', 'է', 'ս', 'տ'],
            correctAnswer: 'է',
          },
          {
            id: 'ex-u2-l1-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "e (as in bed)"?',
            soundHint: 'e (as in bed)',
            options: ['Ա', 'Ս', 'Է', 'Ի'],
            correctAnswer: 'Է',
          },
          {
            id: 'ex-u2-l1-3',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Մ մ. Match uppercase and lowercase',
            target: 'Մ',
            options: ['մ', 'ն', 'ս', 'տ'],
            correctAnswer: 'մ',
          },
          {
            id: 'ex-u2-l1-4',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "m"?',
            soundHint: 'm',
            options: ['Ն', 'Տ', 'Ս', 'Մ'],
            correctAnswer: 'Մ',
          },
          {
            id: 'ex-u2-l1-5',
            type: 'WORD_BUILDER',
            prompt: 'Read եմ (em), meaning "am", then build it. Its ե has no initial y sound.',
            targetWord: 'եմ',
            translation: 'am',
            tokens: ['մ', 'է', 'ե', 'ն'],
            correctAnswer: ['ե', 'մ'],
          },
          {
            id: 'ex-u2-l1-6',
            type: 'WORD_BUILDER',
            prompt: 'Build Ես եմ (yes em), meaning "I am". Use the blank tile for the space.',
            targetWord: 'Ես եմ',
            translation: 'I am',
            tokens: ['մ', ' ', 'Ե', 'է', 'ս', 'ե', 'ն'],
            correctAnswer: ['Ե', 'ս', ' ', 'ե', 'մ'],
          },
        ],
      },
      {
        id: 'lesson-u2-l2',
        unitId: 'hy-u2',
        title: 'Meet Կ կ: Նա է and Սա տուն է',
        orderIndex: 2,
        exercises: [
          {
            id: 'ex-u2-l2-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Կ կ. Match uppercase and lowercase',
            target: 'Կ',
            options: ['մ', 'ն', 'կ', 'տ'],
            correctAnswer: 'կ',
          },
          {
            id: 'ex-u2-l2-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "k (without a puff of air)"?',
            soundHint: 'k (without a puff of air)',
            options: ['Տ', 'Կ', 'Մ', 'Ս'],
            correctAnswer: 'Կ',
          },
          {
            id: 'ex-u2-l2-3',
            type: 'WORD_BUILDER',
            prompt: 'Read սունկ, meaning "mushroom", then build it. Keep ու as one tile.',
            targetWord: 'սունկ',
            translation: 'mushroom',
            tokens: ['կ', 'ս', 'ու', 'ն', 'մ', 'ա'],
            correctAnswer: ['ս', 'ու', 'ն', 'կ'],
          },
          {
            id: 'ex-u2-l2-4',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "n"?',
            soundHint: 'n',
            options: ['Կ', 'Մ', 'Տ', 'Ն'],
            correctAnswer: 'Ն',
          },
          {
            id: 'ex-u2-l2-5',
            type: 'WORD_BUILDER',
            prompt: 'Build Նա է, meaning "he/she is". Use the blank tile for the space.',
            targetWord: 'Նա է',
            translation: 'he/she is',
            tokens: ['է', 'ա', ' ', 'Ն', 'մ', 'ե'],
            correctAnswer: ['Ն', 'ա', ' ', 'է'],
          },
          {
            id: 'ex-u2-l2-6',
            type: 'WORD_BUILDER',
            prompt: 'Build Սա տուն է, meaning "This is a house". Use both blank tiles for spaces.',
            targetWord: 'Սա տուն է',
            translation: 'This is a house',
            tokens: ['է', 'տ', ' ', 'Ս', 'ու', 'ն', 'ա', ' ', 'ե', 'մ'],
            correctAnswer: ['Ս', 'ա', ' ', 'տ', 'ու', 'ն', ' ', 'է'],
          },
        ],
      },
      {
        id: 'lesson-u2-l3',
        unitId: 'hy-u2',
        title: 'Meet Ր ր and Լ լ',
        orderIndex: 3,
        exercises: [
          {
            id: 'ex-u2-l3-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Ր ր. Match uppercase and lowercase',
            target: 'Ր',
            options: ['կ', 'ր', 'մ', 'ն'],
            correctAnswer: 'ր',
          },
          {
            id: 'ex-u2-l3-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "r (light r)"?',
            soundHint: 'r (light r)',
            options: ['Մ', 'Ն', 'Ր', 'Կ'],
            correctAnswer: 'Ր',
          },
          {
            id: 'ex-u2-l3-3',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Լ լ. Match uppercase and lowercase',
            target: 'Լ',
            options: ['լ', 'ն', 'ր', 'կ'],
            correctAnswer: 'լ',
          },
          {
            id: 'ex-u2-l3-4',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "l"?',
            soundHint: 'l',
            options: ['Ր', 'Ս', 'Ն', 'Լ'],
            correctAnswer: 'Լ',
          },
          {
            id: 'ex-u2-l3-5',
            type: 'WORD_BUILDER',
            prompt: 'Read սար, meaning "mountain", then build it.',
            targetWord: 'սար',
            translation: 'mountain',
            tokens: ['ր', 'ա', 'ն', 'ս', 'լ'],
            correctAnswer: ['ս', 'ա', 'ր'],
          },
          {
            id: 'ex-u2-l3-6',
            type: 'WORD_BUILDER',
            prompt: 'Read լար, meaning "string", then build it.',
            targetWord: 'լար',
            translation: 'string',
            tokens: ['ա', 'ր', 'կ', 'լ', 'ս'],
            correctAnswer: ['լ', 'ա', 'ր'],
          },
        ],
      },
      {
        id: 'lesson-u2-l4',
        unitId: 'hy-u2',
        title: 'Identity Reading Checkpoint',
        orderIndex: 4,
        exercises: [
          {
            id: 'ex-u2-l4-1',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Մ',
            options: ['կ', 'լ', 'մ', 'ս'],
            correctAnswer: 'մ',
          },
          {
            id: 'ex-u2-l4-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "e (as in bed)"?',
            soundHint: 'e (as in bed)',
            options: ['է', 'մ', 'կ', 'լ'],
            correctAnswer: 'է',
          },
          {
            id: 'ex-u2-l4-3',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "l"?',
            soundHint: 'l',
            options: ['ր', 'կ', 'մ', 'լ'],
            correctAnswer: 'լ',
          },
          {
            id: 'ex-u2-l4-4',
            type: 'WORD_BUILDER',
            prompt: 'Spell "I am" in Armenian, beginning with a capital letter. Use the blank tile for the space.',
            targetWord: 'Ես եմ',
            translation: 'I am',
            tokens: ['ե', 'մ', 'ս', ' ', 'ն', 'Ե', 'է'],
            correctAnswer: ['Ե', 'ս', ' ', 'ե', 'մ'],
          },
          {
            id: 'ex-u2-l4-5',
            type: 'WORD_BUILDER',
            prompt: 'Spell "he/she is" in Armenian, beginning with a capital letter. Use the blank tile for the space.',
            targetWord: 'Նա է',
            translation: 'he/she is',
            tokens: ['ա', 'ե', 'Ն', 'է', 'մ', ' '],
            correctAnswer: ['Ն', 'ա', ' ', 'է'],
          },
          {
            id: 'ex-u2-l4-6',
            type: 'WORD_BUILDER',
            prompt: 'Spell "This is a house" in Armenian, beginning with a capital letter. Use both blank tiles for spaces.',
            targetWord: 'Սա տուն է',
            translation: 'This is a house',
            tokens: ['ն', ' ', 'ա', 'է', 'Ս', 'մ', 'տ', ' ', 'ու', 'ե'],
            correctAnswer: ['Ս', 'ա', ' ', 'տ', 'ու', 'ն', ' ', 'է'],
          },
        ],
      },
    ],
  },
  {
    id: 'hy-u3',
    scriptId: 'hy',
    title: 'Cognates & Loan Words',
    description:
      'Introduce Օ օ, Ո ո, Պ պ, Բ բ and Ֆ ֆ through recognizable loan words, plus bridge letters Ք ք and և.',
    orderIndex: 3,
    lessons: [
      {
        id: 'lesson-u3-l1',
        unitId: 'hy-u3',
        title: 'Taxi Bridge: Ք ք, then Օ օ and Ո ո',
        orderIndex: 1,
        exercises: [
          {
            id: 'ex-u3-l1-1',
            type: 'LETTER_PAIR',
            prompt: 'Bridge letter for taxi: Ք ք. Match uppercase and lowercase',
            target: 'Ք',
            options: ['ք', 'կ', 'ս', 'տ'],
            correctAnswer: 'ք',
          },
          {
            id: 'ex-u3-l1-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes k with a puff of air, unlike կ?',
            soundHint: 'kʰ (k with a puff of air)',
            options: ['կ', 'տ', 'ք', 'մ'],
            correctAnswer: 'ք',
          },
          {
            id: 'ex-u3-l1-3',
            type: 'WORD_BUILDER',
            prompt: 'Read տաքսի, meaning "taxi", then build it.',
            targetWord: 'տաքսի',
            translation: 'taxi',
            tokens: ['ս', 'կ', 'ի', 'տ', 'ք', 'ա', 'ե'],
            correctAnswer: ['տ', 'ա', 'ք', 'ս', 'ի'],
          },
          {
            id: 'ex-u3-l1-4',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Օ օ. Match uppercase and lowercase',
            target: 'Օ',
            options: ['ս', 'է', 'ա', 'օ'],
            correctAnswer: 'օ',
          },
          {
            id: 'ex-u3-l1-5',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Ո ո. Match uppercase and lowercase',
            target: 'Ո',
            options: ['օ', 'ո', 'ս', 'ն'],
            correctAnswer: 'ո',
          },
          {
            id: 'ex-u3-l1-6',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter usually represents vo at the start of a word?',
            soundHint: 'vo (usually at the start of a word)',
            options: ['Ո', 'Օ', 'Ս', 'Տ'],
            correctAnswer: 'Ո',
          },
        ],
      },
      {
        id: 'lesson-u3-l2',
        unitId: 'hy-u3',
        title: 'Meet Պ պ: Metro and Soup',
        orderIndex: 2,
        exercises: [
          {
            id: 'ex-u3-l2-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Պ պ. Match uppercase and lowercase',
            target: 'Պ',
            options: ['մ', 'ն', 'պ', 'կ'],
            correctAnswer: 'պ',
          },
          {
            id: 'ex-u3-l2-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "p (without a puff of air)"?',
            soundHint: 'p (without a puff of air)',
            options: ['Պ', 'Կ', 'Ք', 'Տ'],
            correctAnswer: 'Պ',
          },
          {
            id: 'ex-u3-l2-3',
            type: 'DECODE_COGNATE',
            prompt: 'Read this loan word; ո sounds o here. What does it mean?',
            targetWord: 'մետրո',
            pronunciation: 'metro',
            options: ['taxi', 'house', 'metro', 'mountain'],
            correctAnswer: 'metro',
          },
          {
            id: 'ex-u3-l2-4',
            type: 'WORD_BUILDER',
            prompt: 'Spell "metro" in Armenian',
            targetWord: 'մետրո',
            translation: 'metro',
            tokens: ['ր', 'ո', 'մ', 'տ', 'ե', 'օ', 'կ'],
            correctAnswer: ['մ', 'ե', 'տ', 'ր', 'ո'],
          },
          {
            id: 'ex-u3-l2-5',
            type: 'DECODE_COGNATE',
            prompt: 'What does this loan word mean?',
            targetWord: 'սուպ',
            pronunciation: 'sup',
            options: ['mushroom', 'soup', 'taxi', 'metro'],
            correctAnswer: 'soup',
          },
          {
            id: 'ex-u3-l2-6',
            type: 'WORD_BUILDER',
            prompt: 'Spell "soup" in Armenian. Keep ու as one tile.',
            targetWord: 'սուպ',
            translation: 'soup',
            tokens: ['պ', 'ս', 'ո', 'ու', 'կ'],
            correctAnswer: ['ս', 'ու', 'պ'],
          },
        ],
      },
      {
        id: 'lesson-u3-l3',
        unitId: 'hy-u3',
        title: 'Meet Բ բ and և: Hello and Opera',
        orderIndex: 3,
        exercises: [
          {
            id: 'ex-u3-l3-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Բ բ. Match uppercase and lowercase',
            target: 'Բ',
            options: ['պ', 'մ', 'կ', 'բ'],
            correctAnswer: 'բ',
          },
          {
            id: 'ex-u3-l3-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "b"?',
            soundHint: 'b',
            options: ['Պ', 'Բ', 'Տ', 'Կ'],
            correctAnswer: 'Բ',
          },
          {
            id: 'ex-u3-l3-3',
            type: 'PHONETIC_SELECT',
            prompt: 'New reading tile: և represents ev after a consonant. Select this tile.',
            soundHint: 'ev (after a consonant)',
            options: ['ե', 'է', 'և', 'ու'],
            correctAnswer: 'և',
          },
          {
            id: 'ex-u3-l3-4',
            type: 'WORD_BUILDER',
            prompt: 'Read բարև (barev), meaning "hello", then build it. Keep և as one tile.',
            targetWord: 'բարև',
            translation: 'hello',
            tokens: ['և', 'պ', 'ա', 'բ', 'ե', 'ր'],
            correctAnswer: ['բ', 'ա', 'ր', 'և'],
          },
          {
            id: 'ex-u3-l3-5',
            type: 'PHONETIC_SELECT',
            prompt: 'In օպերա (opera), which letter represents the initial o sound?',
            soundHint: 'o (at the start of օպերա)',
            options: ['Ո', 'Օ', 'Է', 'Ա'],
            correctAnswer: 'Օ',
          },
          {
            id: 'ex-u3-l3-6',
            type: 'WORD_BUILDER',
            prompt: 'Spell "opera" in Armenian',
            targetWord: 'օպերա',
            translation: 'opera',
            tokens: ['ե', 'օ', 'ր', 'ա', 'պ', 'ո', 'բ'],
            correctAnswer: ['օ', 'պ', 'ե', 'ր', 'ա'],
          },
        ],
      },
      {
        id: 'lesson-u3-l4',
        unitId: 'hy-u3',
        title: 'Meet Ֆ ֆ: Film and Loan-Word Review',
        orderIndex: 4,
        exercises: [
          {
            id: 'ex-u3-l4-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Ֆ ֆ. Match uppercase and lowercase',
            target: 'Ֆ',
            options: ['բ', 'պ', 'ֆ', 'կ'],
            correctAnswer: 'ֆ',
          },
          {
            id: 'ex-u3-l4-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "f"?',
            soundHint: 'f',
            options: ['Բ', 'Պ', 'Մ', 'Ֆ'],
            correctAnswer: 'Ֆ',
          },
          {
            id: 'ex-u3-l4-3',
            type: 'DECODE_COGNATE',
            prompt: 'What does this loan word mean?',
            targetWord: 'ֆիլմ',
            pronunciation: 'film',
            options: ['opera', 'metro', 'film', 'taxi'],
            correctAnswer: 'film',
          },
          {
            id: 'ex-u3-l4-4',
            type: 'WORD_BUILDER',
            prompt: 'Spell "film" in Armenian',
            targetWord: 'ֆիլմ',
            translation: 'film',
            tokens: ['մ', 'ի', 'պ', 'ֆ', 'լ', 'բ'],
            correctAnswer: ['ֆ', 'ի', 'լ', 'մ'],
          },
          {
            id: 'ex-u3-l4-5',
            type: 'DECODE_COGNATE',
            prompt: 'What does this loan word mean?',
            targetWord: 'տաքսի',
            pronunciation: 'takʰsi',
            options: ['metro', 'taxi', 'opera', 'film'],
            correctAnswer: 'taxi',
          },
          {
            id: 'ex-u3-l4-6',
            type: 'WORD_BUILDER',
            prompt: 'Spell "hello" in Armenian. Keep և as one tile.',
            targetWord: 'բարև',
            translation: 'hello',
            tokens: ['ր', 'ֆ', 'բ', 'և', 'ա', 'ե'],
            correctAnswer: ['բ', 'ա', 'ր', 'և'],
          },
        ],
      },
    ],
  },
  {
    id: 'hy-u4',
    scriptId: 'hy',
    title: 'Deceptive Look-alikes',
    description:
      'Distinguish Հ հ from Ն ն, Armenian Տ from Latin S, ո from ռ, and պ from կ through targeted exercises.',
    orderIndex: 4,
    lessons: [
      {
        id: 'lesson-u4-l1',
        unitId: 'hy-u4',
        title: 'Հ հ versus Ն ն',
        orderIndex: 1,
        exercises: [
          {
            id: 'ex-u4-l1-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Հ հ. Match uppercase and lowercase; do not confuse it with Ն ն.',
            target: 'Հ',
            options: ['ն', 'մ', 'կ', 'հ'],
            correctAnswer: 'հ',
          },
          {
            id: 'ex-u4-l1-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "h"?',
            soundHint: 'h',
            options: ['ն', 'հ', 'կ', 'մ'],
            correctAnswer: 'հ',
          },
          {
            id: 'ex-u4-l1-3',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ն',
            options: ['հ', 'մ', 'ն', 'կ'],
            correctAnswer: 'ն',
          },
          {
            id: 'ex-u4-l1-4',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "n"?',
            soundHint: 'n',
            options: ['Հ', 'Մ', 'Ն', 'Տ'],
            correctAnswer: 'Ն',
          },
          {
            id: 'ex-u4-l1-5',
            type: 'WORD_BUILDER',
            prompt: 'Read հին, meaning "old", then build it. Notice both հ and ն.',
            targetWord: 'հին',
            translation: 'old',
            tokens: ['ն', 'հ', 'մ', 'ի', 'կ'],
            correctAnswer: ['հ', 'ի', 'ն'],
          },
          {
            id: 'ex-u4-l1-6',
            type: 'WORD_BUILDER',
            prompt: 'Spell "he/she" in Armenian using lowercase letters.',
            targetWord: 'նա',
            translation: 'he/she',
            tokens: ['ա', 'հ', 'ն', 'մ'],
            correctAnswer: ['ն', 'ա'],
          },
        ],
      },
      {
        id: 'lesson-u4-l2',
        unitId: 'hy-u4',
        title: 'Armenian Տ Is Not Latin S',
        orderIndex: 2,
        exercises: [
          {
            id: 'ex-u4-l2-1',
            type: 'LETTER_PAIR',
            prompt: 'Armenian Տ can look like Latin S, but represents t. Match it to its lowercase.',
            target: 'Տ',
            options: ['ս', 'հ', 'տ', 'ն'],
            correctAnswer: 'տ',
          },
          {
            id: 'ex-u4-l2-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which Armenian letter represents t, not s?',
            soundHint: 't (without a puff of air)',
            options: ['Ս', 'Տ', 'Հ', 'Ն'],
            correctAnswer: 'Տ',
          },
          {
            id: 'ex-u4-l2-3',
            type: 'PHONETIC_SELECT',
            prompt: 'Which Armenian letter really represents s?',
            soundHint: 's',
            options: ['Տ', 'Հ', 'Ն', 'Ս'],
            correctAnswer: 'Ս',
          },
          {
            id: 'ex-u4-l2-4',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ս',
            options: ['ս', 'տ', 'հ', 'ն'],
            correctAnswer: 'ս',
          },
          {
            id: 'ex-u4-l2-5',
            type: 'WORD_BUILDER',
            prompt: 'Spell "house" in Armenian with an initial capital letter.',
            targetWord: 'Տուն',
            translation: 'house',
            tokens: ['Ս', 'ն', 'Տ', 'ու', 'հ'],
            correctAnswer: ['Տ', 'ու', 'ն'],
          },
          {
            id: 'ex-u4-l2-6',
            type: 'WORD_BUILDER',
            prompt: 'Spell "taxi" in Armenian',
            targetWord: 'տաքսի',
            translation: 'taxi',
            tokens: ['ք', 'ս', 'ա', 'ի', 'տ', 'ն', 'հ'],
            correctAnswer: ['տ', 'ա', 'ք', 'ս', 'ի'],
          },
        ],
      },
      {
        id: 'lesson-u4-l3',
        unitId: 'hy-u4',
        title: 'ո versus ռ: Vowel or Rolled r?',
        orderIndex: 3,
        exercises: [
          {
            id: 'ex-u4-l3-1',
            type: 'LETTER_PAIR',
            prompt: 'New letter: Ռ ռ. Match uppercase and lowercase; distinguish ռ from ո and ր.',
            target: 'Ռ',
            options: ['ո', 'ր', 'ռ', 'ն'],
            correctAnswer: 'ռ',
          },
          {
            id: 'ex-u4-l3-2',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter represents rolled r, rather than light r or a vowel?',
            soundHint: 'rr (rolled r)',
            options: ['ո', 'ր', 'լ', 'ռ'],
            correctAnswer: 'ռ',
          },
          {
            id: 'ex-u4-l3-3',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Ո',
            options: ['ո', 'ռ', 'ր', 'ն'],
            correctAnswer: 'ո',
          },
          {
            id: 'ex-u4-l3-4',
            type: 'PHONETIC_SELECT',
            prompt: 'In մետրո, which letter represents the final o sound?',
            soundHint: 'o (at the end of մետրո)',
            options: ['ռ', 'ո', 'ր', 'ն'],
            correctAnswer: 'ո',
          },
          {
            id: 'ex-u4-l3-5',
            type: 'WORD_BUILDER',
            prompt: 'Spell "metro" in Armenian',
            targetWord: 'մետրո',
            translation: 'metro',
            tokens: ['մ', 'ռ', 'ե', 'ր', 'տ', 'ո', 'ն'],
            correctAnswer: ['մ', 'ե', 'տ', 'ր', 'ո'],
          },
          {
            id: 'ex-u4-l3-6',
            type: 'WORD_BUILDER',
            prompt: 'Read առու, meaning "stream", then build it. Choose ռ, not ո or ր.',
            targetWord: 'առու',
            translation: 'stream',
            tokens: ['ու', 'ո', 'ռ', 'ա', 'ր'],
            correctAnswer: ['ա', 'ռ', 'ու'],
          },
        ],
      },
      {
        id: 'lesson-u4-l4',
        unitId: 'hy-u4',
        title: 'պ versus կ: Final Reading Checkpoint',
        orderIndex: 4,
        exercises: [
          {
            id: 'ex-u4-l4-1',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Պ',
            options: ['կ', 'պ', 'բ', 'մ'],
            correctAnswer: 'պ',
          },
          {
            id: 'ex-u4-l4-2',
            type: 'LETTER_PAIR',
            prompt: 'Match uppercase and lowercase',
            target: 'Կ',
            options: ['պ', 'բ', 'կ', 'մ'],
            correctAnswer: 'կ',
          },
          {
            id: 'ex-u4-l4-3',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "p (without a puff of air)"?',
            soundHint: 'p (without a puff of air)',
            options: ['պ', 'կ', 'բ', 'ք'],
            correctAnswer: 'պ',
          },
          {
            id: 'ex-u4-l4-4',
            type: 'PHONETIC_SELECT',
            prompt: 'Which letter makes the sound "k (without a puff of air)"?',
            soundHint: 'k (without a puff of air)',
            options: ['պ', 'ք', 'կ', 'բ'],
            correctAnswer: 'կ',
          },
          {
            id: 'ex-u4-l4-5',
            type: 'WORD_BUILDER',
            prompt: 'Spell "soup" in Armenian',
            targetWord: 'սուպ',
            translation: 'soup',
            tokens: ['ս', 'կ', 'ու', 'պ', 'բ'],
            correctAnswer: ['ս', 'ու', 'պ'],
          },
          {
            id: 'ex-u4-l4-6',
            type: 'WORD_BUILDER',
            prompt: 'Spell "mushroom" in Armenian',
            targetWord: 'սունկ',
            translation: 'mushroom',
            tokens: ['պ', 'ն', 'կ', 'ս', 'ու', 'մ'],
            correctAnswer: ['ս', 'ու', 'ն', 'կ'],
          },
        ],
      },
    ],
  },
];

