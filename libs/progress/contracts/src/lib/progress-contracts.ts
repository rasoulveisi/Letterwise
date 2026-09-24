import { z } from 'zod';

export const AppProgressV2LightSchema = z
  .object({
    version: z.literal(2),
    letters: z.record(z.string(), z.unknown()),
    completedLessons: z.array(z.string()).optional(),
    xp: z.number().optional(),
    hearts: z.number().optional(),
    streakCount: z.number().optional(),
    lastCompletedDate: z.string().optional(),
  })
  .passthrough();

export const ProgressResponseSchema = z.object({
  scriptId: z.string(),
  progress: AppProgressV2LightSchema.nullable(),
  updatedAt: z.string().nullable(),
});

export const ProgressListResponseSchema = z.object({
  items: z.array(ProgressResponseSchema.extend({ progress: AppProgressV2LightSchema })),
});

export const UpsertProgressRequestSchema = z.object({
  progress: AppProgressV2LightSchema,
});

export type AppProgressV2Light = z.infer<typeof AppProgressV2LightSchema>;
export type ProgressResponse = z.infer<typeof ProgressResponseSchema>;
export type ProgressListResponse = z.infer<typeof ProgressListResponseSchema>;
export type UpsertProgressRequest = z.infer<typeof UpsertProgressRequestSchema>;

export const LetterPairExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('LETTER_PAIR'),
  prompt: z.string(),
  target: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

export const PhoneticSelectExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('PHONETIC_SELECT'),
  prompt: z.string(),
  soundHint: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

export const DecodeCognateExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('DECODE_COGNATE'),
  prompt: z.string(),
  targetWord: z.string(),
  pronunciation: z.string().optional(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

export const WordBuilderExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('WORD_BUILDER'),
  prompt: z.string(),
  targetWord: z.string(),
  translation: z.string().optional(),
  tokens: z.array(z.string()),
  correctAnswer: z.array(z.string()),
});

export const CurriculumExerciseSchema = z.discriminatedUnion('type', [
  LetterPairExerciseSchema,
  PhoneticSelectExerciseSchema,
  DecodeCognateExerciseSchema,
  WordBuilderExerciseSchema,
]);

export const CurriculumLessonSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  title: z.string(),
  orderIndex: z.number(),
  exercises: z.array(CurriculumExerciseSchema),
});

export const CurriculumUnitSchema = z.object({
  id: z.string(),
  scriptId: z.string(),
  title: z.string(),
  description: z.string(),
  orderIndex: z.number(),
  lessons: z.array(CurriculumLessonSchema),
});

export const CurriculumResponseSchema = z.object({
  units: z.array(CurriculumUnitSchema),
});

export const LessonCompleteRequestSchema = z.object({
  lessonId: z.string(),
  xpGained: z.number().default(10),
  hearts: z.number().optional(),
});

export const LessonCompleteResponseSchema = z.object({
  completedLessons: z.array(z.string()),
  xp: z.number(),
  streakCount: z.number(),
  hearts: z.number(),
});

export type LetterPairExercise = z.infer<typeof LetterPairExerciseSchema>;
export type PhoneticSelectExercise = z.infer<typeof PhoneticSelectExerciseSchema>;
export type DecodeCognateExercise = z.infer<typeof DecodeCognateExerciseSchema>;
export type WordBuilderExercise = z.infer<typeof WordBuilderExerciseSchema>;
export type CurriculumExercise = z.infer<typeof CurriculumExerciseSchema>;
export type CurriculumLesson = z.infer<typeof CurriculumLessonSchema>;
export type CurriculumUnit = z.infer<typeof CurriculumUnitSchema>;
export type CurriculumResponse = z.infer<typeof CurriculumResponseSchema>;
export type LessonCompleteRequest = z.infer<typeof LessonCompleteRequestSchema>;
export type LessonCompleteResponse = z.infer<typeof LessonCompleteResponseSchema>;

