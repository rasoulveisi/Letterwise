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
    title: 'Unit 1: First Words & Vowels',
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
    title: 'Unit 2: Identity & Basic Verbs',
    description: 'Learn Է, Մ, Կ, Ր, Լ and form simple sentences.',
    orderIndex: 2,
    lessons: [],
  },
  {
    id: 'hy-u3',
    scriptId: 'hy',
    title: 'Unit 3: Cognates & Loan Words',
    description: 'Learn Օ/Ո, Պ, Բ, Ֆ and read familiar loan words.',
    orderIndex: 3,
    lessons: [],
  },
  {
    id: 'hy-u4',
    scriptId: 'hy',
    title: 'Unit 4: Deceptive Look-alikes',
    description: 'Disambiguate look-alikes like Հ vs Ն and Տ vs S.',
    orderIndex: 4,
    lessons: [],
  },
];

