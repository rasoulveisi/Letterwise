import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { AppProgress, HintLevel } from '../core/models';
import {
  applyLessonCompletion,
  applyLetterResult,
  emptyProgress,
  loadProgress,
  nextProgressTimestamp,
  progressStorageKey,
  saveProgress,
} from '../core/progress-storage';
import { ProgressApiClient } from './progress-api.client';
import { ProgressSyncService } from './progress-sync.service';
import { ScriptContextService } from './script-context.service';

export interface LetterOutcome {
  readonly correct: boolean;
  readonly nextStreak: number;
  readonly nextHintLevel: HintLevel;
}

@Injectable()
export class ProgressService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ctx = inject(ScriptContextService);
  private readonly sync = inject(ProgressSyncService);
  private readonly api = inject(ProgressApiClient, { optional: true });

  readonly state = signal<AppProgress>(emptyProgress());

  readonly completedLessons = computed(() => {
    const p = this.state();
    return (p.version === 2 ? p.completedLessons : []) ?? [];
  });
  readonly xp = computed(() => {
    const p = this.state();
    return p.version === 2 ? p.xp ?? 0 : 0;
  });
  readonly hearts = computed(() => {
    const p = this.state();
    return p.version === 2 ? p.hearts ?? 5 : 5;
  });
  readonly streakCount = computed(() => {
    const p = this.state();
    return p.version === 2 ? p.streakCount ?? 0 : 0;
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    effect(() => {
      const id = this.ctx.scriptId();
      if (!id) {
        this.state.set(emptyProgress());
        this.sync.setActiveScript(undefined);
        return;
      }
      this.sync.setActiveScript(id);
      this.state.set(loadProgress(progressStorageKey(id)));
    });
  }

  recordLetterOutcome(letterKey: string, outcome: LetterOutcome): void {
    const id = this.ctx.scriptId();
    if (!id || !isPlatformBrowser(this.platformId)) {
      return;
    }
    const key = progressStorageKey(id);
    const next = applyLetterResult(this.state(), letterKey, {
      ...outcome,
      updatedAtMs: nextProgressTimestamp(),
    });
    this.state.set(next);
    saveProgress(key, next);
    if (next.version === 2) {
      this.sync.schedulePush(id);
    }
  }

  recordLessonCompletion(lessonId: string, xpGained = 15, hearts = 5): void {
    const id = this.ctx.scriptId();
    if (!id || !isPlatformBrowser(this.platformId)) return;
    const key = progressStorageKey(id);
    const next = applyLessonCompletion(this.state(), lessonId, xpGained, hearts);
    this.state.set(next);
    saveProgress(key, next);
    this.sync.schedulePush(id);
    if (this.sync.status() !== 'offline' && this.api) {
      // Also trigger direct lesson-complete API call if signed in
      void this.api.completeLesson(id, { lessonId, xpGained, hearts }).catch(() => {});
    }
  }
}
