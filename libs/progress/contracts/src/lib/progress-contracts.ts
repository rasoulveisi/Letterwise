import { z } from 'zod';

export const AppProgressV2LightSchema = z.object({
  version: z.literal(2),
  letters: z.record(z.string(), z.unknown()),
});

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
