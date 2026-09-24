import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  LessonCompleteRequestSchema,
  type LessonCompleteResponse,
  UpsertProgressRequestSchema,
} from '@letterwise/progress/contracts';
import { mergeProgressV2, type AppProgressV2 } from '@letterwise/progress/domain';
import { isKnownScriptId, KNOWN_SCRIPT_IDS } from '@letterwise/scripts/domain';
import { SupabaseClientFactory } from '../supabase/supabase-client.factory';
import type { ProgressListResponse, ProgressResponse, ProgressRow } from './progress.types';

@Injectable()
export class ProgressService {
  constructor(private readonly supabaseFactory: SupabaseClientFactory) {}

  async getOne(accessToken: string, userId: string, scriptId: string): Promise<ProgressResponse> {
    this.assertScriptId(scriptId);
    const row = await this.selectOne(accessToken, userId, scriptId);
    if (!row) {
      return { scriptId, progress: null, updatedAt: null };
    }
    return {
      scriptId,
      progress: this.parseStoredProgress(row.progress),
      updatedAt: row.updated_at,
    };
  }

  async getAll(accessToken: string, userId: string): Promise<ProgressListResponse> {
    const client = this.supabaseFactory.forUserToken(accessToken);
    const { data, error } = await client
      .from('user_script_progress')
      .select('user_id,script_id,progress,updated_at')
      .eq('user_id', userId)
      .in('script_id', [...KNOWN_SCRIPT_IDS]);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      items: ((data as ProgressRow[] | null) ?? [])
        .filter((row) => isKnownScriptId(row.script_id))
        .map((row) => ({
          scriptId: row.script_id,
          progress: this.parseStoredProgress(row.progress),
          updatedAt: row.updated_at,
        })),
    };
  }

  async upsert(accessToken: string, userId: string, scriptId: string, body: unknown): Promise<ProgressResponse> {
    this.assertScriptId(scriptId);
    const parsed = UpsertProgressRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid progress payload');
    }

    const incoming = parsed.data.progress as AppProgressV2;
    const existing = await this.selectOne(accessToken, userId, scriptId);
    const remote = existing ? this.parseStoredProgress(existing.progress) : null;
    const merged = mergeProgressV2(remote, incoming);
    const client = this.supabaseFactory.forUserToken(accessToken);

    const { data, error } = await client
      .from('user_script_progress')
      .upsert(
        {
          user_id: userId,
          script_id: scriptId,
          progress: merged,
        },
        { onConflict: 'user_id,script_id' },
      )
      .select('user_id,script_id,progress,updated_at')
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!data) {
      throw new InternalServerErrorException('Progress upsert returned no row');
    }

    const row = data as ProgressRow;
    return {
      scriptId: row.script_id,
      progress: this.parseStoredProgress(row.progress),
      updatedAt: row.updated_at,
    };
  }

  async completeLesson(
    accessToken: string,
    userId: string,
    scriptId: string,
    body: unknown,
  ): Promise<LessonCompleteResponse> {
    const parsed = LessonCompleteRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid lesson complete payload');
    }
    this.assertScriptId(scriptId);

    const existing = await this.selectOne(accessToken, userId, scriptId);
    const existingProgress: AppProgressV2 = existing
      ? this.parseStoredProgress(existing.progress)
      : { version: 2, letters: {} };
    const rawProgress =
      existing?.progress && typeof existing.progress === 'object'
        ? (existing.progress as Record<string, unknown>)
        : {};

    const existingCompleted =
      existingProgress.completedLessons ??
      (rawProgress['completedLessons'] as readonly string[] | undefined) ??
      [];
    const completedLessons = Array.from(new Set([...existingCompleted, parsed.data.lessonId]));

    const existingXp =
      existingProgress.xp ?? (rawProgress['xp'] as number | undefined) ?? 0;
    const xp = existingXp + parsed.data.xpGained;

    const today = new Date().toISOString().slice(0, 10);
    const lastDate =
      existingProgress.lastCompletedDate ??
      (rawProgress['lastCompletedDate'] as string | undefined);
    let streak =
      existingProgress.streakCount ??
      (rawProgress['streakCount'] as number | undefined) ??
      0;
    if (!lastDate) {
      streak = 1;
    } else if (lastDate === today) {
      streak = Math.max(streak, 1);
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    const hearts =
      parsed.data.hearts ??
      existingProgress.hearts ??
      (rawProgress['hearts'] as number | undefined) ??
      5;

    const updatedProgress: AppProgressV2 = {
      ...existingProgress,
      completedLessons,
      xp,
      streakCount: streak,
      hearts,
      lastCompletedDate: today,
    };

    const client = this.supabaseFactory.forUserToken(accessToken);

    const upsertPayloadWithColumns = {
      user_id: userId,
      script_id: scriptId,
      progress: updatedProgress,
      completed_lessons: completedLessons,
      xp,
      hearts,
      streak_count: streak,
    };

    const { error: upsertError } = await client
      .from('user_script_progress')
      .upsert(upsertPayloadWithColumns, { onConflict: 'user_id,script_id' });

    if (upsertError) {
      const fallback = await client
        .from('user_script_progress')
        .upsert(
          {
            user_id: userId,
            script_id: scriptId,
            progress: updatedProgress,
          },
          { onConflict: 'user_id,script_id' },
        );

      if (fallback.error) {
        throw new InternalServerErrorException(fallback.error.message);
      }
    }

    return {
      completedLessons,
      xp,
      streakCount: streak,
      hearts,
    };
  }

  private async selectOne(accessToken: string, userId: string, scriptId: string): Promise<ProgressRow | null> {
    const client = this.supabaseFactory.forUserToken(accessToken);
    const { data, error } = await client
      .from('user_script_progress')
      .select('user_id,script_id,progress,updated_at')
      .eq('user_id', userId)
      .eq('script_id', scriptId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data as ProgressRow | null) ?? null;
  }

  private assertScriptId(scriptId: string): void {
    if (!isKnownScriptId(scriptId)) {
      throw new NotFoundException('Unknown script');
    }
  }

  private parseStoredProgress(progress: unknown): AppProgressV2 {
    const parsed = UpsertProgressRequestSchema.shape.progress.safeParse(progress);
    if (!parsed.success) {
      throw new InternalServerErrorException('Stored progress is malformed');
    }
    return parsed.data as AppProgressV2;
  }
}
