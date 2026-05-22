import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { buildSessionExercises } from '../../core/session-builder';
import type { Exercise } from '../../core/models';
import { nextHintLevelAfterResult } from '../../core/hint-policy';
import { LetterPick } from '../../exercises/letter-pick/letter-pick';
import { MinimalPairPick } from '../../exercises/minimal-pair-pick/minimal-pair-pick';
import { ProgressService } from '../../services/progress.service';
import { ScriptContextService } from '../../services/script-context.service';

@Component({
  selector: 'app-session',
  imports: [LetterPick, MinimalPairPick, RouterLink],
  templateUrl: './session.html',
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
})
export class Session {
  private readonly ctx = inject(ScriptContextService);
  private readonly progress = inject(ProgressService);

  private readonly exercises = signal<Exercise[]>([]);

  protected readonly index = signal(0);
  protected readonly current = computed(() => this.exercises()[this.index()] ?? null);
  protected readonly done = computed(() => {
    const total = this.exercises().length;
    return total > 0 && this.index() >= total;
  });

  constructor() {
    afterNextRender(() => {
      const def = this.ctx.definition();
      if (!def) {
        return;
      }
      this.exercises.set(
        buildSessionExercises(def, this.progress.state(), {
          random: Math.random,
          exerciseCount: 8,
        }),
      );
    });
  }

  protected hintFor(letter: string) {
    return this.progress.state().letters[letter]?.hintLevel ?? 2;
  }

  protected onAnswer(letterKey: string, correct: boolean): void {
    const prev = this.progress.state().letters[letterKey] ?? {
      hintLevel: 2 as const,
      consecutiveCorrect: 0,
      wrongAnswers: 0,
    };
    const nextStreak = correct ? prev.consecutiveCorrect + 1 : 0;
    const nextHint = nextHintLevelAfterResult(prev.hintLevel, correct, nextStreak);
    this.progress.recordLetterOutcome(letterKey, {
      correct,
      nextStreak,
      nextHintLevel: nextHint,
    });
    this.index.update((i) => i + 1);
  }
}
