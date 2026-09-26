import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ARMENIAN_CURRICULUM, type CurriculumExercise, type CurriculumLesson } from '@letterwise/scripts/domain';
import { ProgressApiClient } from '../../services/progress-api.client';
import { ProgressService } from '../../services/progress.service';
import { ScriptContextService } from '../../services/script-context.service';

@Component({
  selector: 'app-lesson-runner',
  imports: [],
  template: `
    @if (isOutOfHearts()) {
      <div class="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
        <div class="mb-4 text-6xl" aria-hidden="true">💔</div>
        <h2 class="text-2xl font-bold text-neutral-900">You ran out of hearts!</h2>
        <p class="mt-2 text-sm text-neutral-600">
          Take a break, review the alphabet, or try this lesson again with refilled hearts.
        </p>
        <div class="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            class="h-12 w-full rounded-xl bg-rose-600 font-semibold text-white shadow-sm transition hover:bg-rose-700 active:bg-rose-800"
            (click)="retryLesson()"
          >
            Try Again (5 ❤️)
          </button>
          <button
            type="button"
            class="h-11 w-full rounded-xl border border-neutral-300 bg-white font-semibold text-neutral-800 shadow-xs transition hover:bg-neutral-50 active:bg-neutral-100"
            (click)="returnToPath()"
          >
            Return to Path
          </button>
        </div>
      </div>
    } @else if (isSessionComplete()) {
      <div class="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
        <div class="mb-3 text-6xl animate-bounce" aria-hidden="true">🏆</div>
        <h2 class="text-2xl font-bold text-neutral-900">Lesson Complete!</h2>
        <p class="mt-1 text-sm text-neutral-600">Great job expanding your Armenian knowledge!</p>

        <div class="my-8 grid w-full max-w-xs grid-cols-3 gap-3">
          <div class="flex flex-col items-center rounded-2xl border border-amber-200 bg-amber-50/80 p-3 shadow-xs">
            <span class="text-2xl mb-1" aria-hidden="true">⚡</span>
            <span class="text-xs font-semibold text-neutral-500">XP</span>
            <span class="text-base font-bold text-amber-900">+{{ xpEarned() + 10 }}</span>
          </div>
          <div class="flex flex-col items-center rounded-2xl border border-orange-200 bg-orange-50/80 p-3 shadow-xs">
            <span class="text-2xl mb-1" aria-hidden="true">🔥</span>
            <span class="text-xs font-semibold text-neutral-500">Streak</span>
            <span class="text-base font-bold text-orange-900">{{ progress.streakCount() }}</span>
          </div>
          <div class="flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50/80 p-3 shadow-xs">
            <span class="text-2xl mb-1" aria-hidden="true">❤️</span>
            <span class="text-xs font-semibold text-neutral-500">Accuracy</span>
            <span class="text-base font-bold text-rose-900">{{ accuracy() }}</span>
          </div>
        </div>

        <div class="w-full max-w-xs">
          <button
            type="button"
            class="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:bg-emerald-800"
            (click)="returnToPath()"
          >
            Continue to Path
          </button>
        </div>
      </div>
    } @else if (currentExercise(); as ex) {
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="shrink-0 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            (click)="returnToPath()"
            aria-label="Close lesson"
          >
            <span class="text-xl font-bold">✕</span>
          </button>

          <div class="flex-1 h-3 rounded-full bg-neutral-200 overflow-hidden">
            <div
              class="h-full bg-blue-600 transition-all duration-300 ease-out"
              [style.width.%]="progressPercent()"
            ></div>
          </div>

          <div class="flex items-center gap-1 font-bold text-rose-600 px-2">
            <span class="text-lg" aria-hidden="true">❤️</span>
            <span class="text-sm">{{ hearts() }}</span>
          </div>
        </header>

        <!-- Exercise Content -->
        <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
          <div class="mx-auto flex max-w-md flex-col items-center">
            <p class="text-center text-lg font-semibold text-neutral-900">{{ ex.prompt }}</p>

            @switch (ex.type) {
              @case ('LETTER_PAIR') {
                <div class="my-6 flex h-28 w-28 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 shadow-xs">
                  <span class="text-6xl font-bold text-neutral-900">{{ ex.target }}</span>
                </div>

                <div class="grid w-full max-w-xs grid-cols-2 gap-3">
                  @for (opt of ex.options; track opt) {
                    <button
                      type="button"
                      (click)="selectOption(opt)"
                      class="flex h-16 touch-manipulation items-center justify-center rounded-xl border text-3xl font-bold shadow-xs transition-all active:scale-95"
                      [class.border-blue-600]="selectedAnswer() === opt"
                      [class.bg-blue-50]="selectedAnswer() === opt"
                      [class.text-blue-900]="selectedAnswer() === opt"
                      [class.ring-2]="selectedAnswer() === opt"
                      [class.ring-blue-500]="selectedAnswer() === opt"
                      [class.border-neutral-200]="selectedAnswer() !== opt"
                      [class.bg-white]="selectedAnswer() !== opt"
                      [class.text-neutral-900]="selectedAnswer() !== opt"
                      [class.hover:bg-neutral-50]="selectedAnswer() !== opt"
                    >
                      {{ opt }}
                    </button>
                  }
                </div>
              }

              @case ('PHONETIC_SELECT') {
                <div class="my-6 inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-xs">
                  <span class="text-2xl font-bold text-amber-900">[ {{ ex.soundHint }} ]</span>
                </div>

                <div class="grid w-full max-w-xs grid-cols-2 gap-3">
                  @for (opt of ex.options; track opt) {
                    <button
                      type="button"
                      (click)="selectOption(opt)"
                      class="flex h-16 touch-manipulation items-center justify-center rounded-xl border text-3xl font-bold shadow-xs transition-all active:scale-95"
                      [class.border-blue-600]="selectedAnswer() === opt"
                      [class.bg-blue-50]="selectedAnswer() === opt"
                      [class.text-blue-900]="selectedAnswer() === opt"
                      [class.ring-2]="selectedAnswer() === opt"
                      [class.ring-blue-500]="selectedAnswer() === opt"
                      [class.border-neutral-200]="selectedAnswer() !== opt"
                      [class.bg-white]="selectedAnswer() !== opt"
                      [class.text-neutral-900]="selectedAnswer() !== opt"
                      [class.hover:bg-neutral-50]="selectedAnswer() !== opt"
                    >
                      {{ opt }}
                    </button>
                  }
                </div>
              }

              @case ('DECODE_COGNATE') {
                <div class="my-4 flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-8 py-5 shadow-xs">
                  <span class="text-5xl font-bold text-neutral-900">{{ ex.targetWord }}</span>
                  @if (ex.pronunciation) {
                    <span class="mt-2 text-sm font-medium text-neutral-500">[{{ ex.pronunciation }}]</span>
                  }
                </div>

                <div class="mt-2 grid w-full max-w-xs grid-cols-1 gap-2.5">
                  @for (opt of ex.options; track opt) {
                    <button
                      type="button"
                      (click)="selectOption(opt)"
                      class="flex min-h-13 touch-manipulation items-center justify-center rounded-xl border px-4 text-base font-semibold shadow-xs transition-all active:scale-98"
                      [class.border-blue-600]="selectedAnswer() === opt"
                      [class.bg-blue-50]="selectedAnswer() === opt"
                      [class.text-blue-900]="selectedAnswer() === opt"
                      [class.ring-2]="selectedAnswer() === opt"
                      [class.ring-blue-500]="selectedAnswer() === opt"
                      [class.border-neutral-200]="selectedAnswer() !== opt"
                      [class.bg-white]="selectedAnswer() !== opt"
                      [class.text-neutral-900]="selectedAnswer() !== opt"
                      [class.hover:bg-neutral-50]="selectedAnswer() !== opt"
                    >
                      {{ opt }}
                    </button>
                  }
                </div>
              }

              @case ('WORD_BUILDER') {
                @if (ex.translation) {
                  <div class="my-3 inline-flex items-center rounded-full bg-neutral-100 px-3.5 py-1 text-xs font-semibold text-neutral-700">
                    Translation: "{{ ex.translation }}"
                  </div>
                }

                <div class="mt-2 flex w-full flex-col items-center gap-4">
                  <!-- Word assembly line -->
                  <div
                    class="flex min-h-[4.5rem] w-full max-w-sm flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 p-3"
                  >
                    @if (assembledTokens().length === 0) {
                      <span class="text-xs font-medium text-neutral-400">Tap letters below to assemble word</span>
                    } @else {
                      @for (tok of assembledTokens(); track $index) {
                        <button
                          type="button"
                          (click)="removeToken(tok, $index)"
                          class="flex h-12 min-w-11 touch-manipulation items-center justify-center rounded-xl border-2 border-blue-500 bg-white px-3 text-2xl font-bold text-blue-900 shadow-xs transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 active:scale-95"
                          [class.min-w-16]="tok === ' '"
                          [attr.aria-label]="tok === ' ' ? 'Remove space' : 'Remove letter ' + tok"
                        >
                          @if (tok === ' ') {
                            <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">[space]</span>
                          } @else {
                            {{ tok }}
                          }
                        </button>
                      }
                    }
                  </div>

                  <!-- Available tokens pool -->
                  <div class="mt-2 flex max-w-sm flex-wrap items-center justify-center gap-2.5">
                    @for (tok of remainingTokens(); track $index) {
                      <button
                        type="button"
                        (click)="pickToken(tok, $index)"
                        class="flex h-13 min-w-12 touch-manipulation items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-2xl font-bold text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-95 active:bg-neutral-100"
                        [class.min-w-20]="tok === ' '"
                        [class.bg-neutral-50]="tok === ' '"
                        [attr.aria-label]="tok === ' ' ? 'Add space' : 'Add letter ' + tok"
                      >
                        @if (tok === ' ') {
                          <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500">␣ space</span>
                        } @else {
                          {{ tok }}
                        }
                      </button>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </main>

        <!-- Action Footer / Immediate Bottom Drawer Feedback -->
        @if (feedbackState() === 'idle') {
          <footer class="shrink-0 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
            <div class="mx-auto max-w-md">
              <button
                type="button"
                [disabled]="isCheckDisabled()"
                (click)="checkAnswer()"
                class="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none"
              >
                Check
              </button>
            </div>
          </footer>
        } @else if (feedbackState() === 'correct') {
          <footer class="shrink-0 border-t-2 border-emerald-500 bg-emerald-50 px-4 py-4 transition-all">
            <div class="mx-auto flex max-w-md flex-col gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white shadow-xs"
                >
                  ✓
                </div>
                <div>
                  <p class="text-lg font-bold text-emerald-900">Excellent!</p>
                  <p class="text-xs font-semibold text-emerald-700">+5 XP</p>
                </div>
              </div>
              <button
                type="button"
                (click)="advanceAfterCorrect()"
                class="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:bg-emerald-800"
              >
                Continue
              </button>
            </div>
          </footer>
        } @else if (feedbackState() === 'wrong') {
          <footer class="shrink-0 border-t-2 border-rose-500 bg-rose-50 px-4 py-4 transition-all">
            <div class="mx-auto flex max-w-md flex-col gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xl font-bold text-white shadow-xs"
                >
                  ✕
                </div>
                <div>
                  <p class="text-lg font-bold text-rose-900">Incorrect</p>
                  <p class="text-sm font-medium text-rose-800">
                    Correct solution:
                    <span class="font-bold underline">{{ correctSolutionText() }}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                (click)="advanceAfterWrong()"
                class="h-12 w-full rounded-xl bg-rose-600 text-base font-semibold text-white shadow-sm transition hover:bg-rose-700 active:bg-rose-800"
              >
                Got it
              </button>
            </div>
          </footer>
        }
      </div>
    } @else {
      <div class="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
        <p class="text-neutral-500">Loading lesson...</p>
        <button
          type="button"
          class="mt-4 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          (click)="returnToPath()"
        >
          Return to Path
        </button>
      </div>
    }
  `,
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
})
export class LessonRunner {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ctx = inject(ScriptContextService);
  protected readonly progress = inject(ProgressService);
  private readonly api = inject(ProgressApiClient);

  protected readonly lesson = signal<CurriculumLesson | null>(null);
  protected readonly currentIndex = signal(0);
  protected readonly selectedAnswer = signal<string | null>(null);
  protected readonly assembledTokens = signal<string[]>([]);
  protected readonly remainingTokens = signal<string[]>([]);
  protected readonly hearts = signal(5);
  protected readonly xpEarned = signal(0);
  protected readonly feedbackState = signal<'idle' | 'correct' | 'wrong'>('idle');
  protected readonly isSessionComplete = signal(false);
  protected readonly isOutOfHearts = signal(false);

  protected readonly exercises = computed(() => this.lesson()?.exercises ?? []);
  protected readonly totalExercises = computed(() => this.exercises().length);
  protected readonly currentExercise = computed(() => this.exercises()[this.currentIndex()] ?? null);

  protected readonly progressPercent = computed(() => {
    const total = this.totalExercises();
    return total > 0 ? Math.min(100, Math.round((this.currentIndex() / total) * 100)) : 0;
  });

  protected readonly accuracy = computed(() => {
    const h = this.hearts();
    return `${Math.max(20, Math.round((h / 5) * 100))}%`;
  });

  protected readonly isCheckDisabled = computed(() => {
    const ex = this.currentExercise();
    if (!ex) return true;
    if (ex.type === 'WORD_BUILDER') {
      return this.assembledTokens().length === 0;
    }
    return this.selectedAnswer() === null;
  });

  protected readonly correctSolutionText = computed(() => {
    const ex = this.currentExercise();
    if (!ex) return '';
    if (ex.type === 'WORD_BUILDER') {
      return ex.correctAnswer.join('');
    }
    return ex.correctAnswer;
  });

  constructor() {
    effect(() => {
      const paramId = this.route.snapshot.paramMap.get('lessonId');
      const scriptId = this.ctx.scriptId() ?? 'hy';
      if (!paramId) return;

      const local = ARMENIAN_CURRICULUM.flatMap((u) => u.lessons).find((l) => l.id === paramId);
      if (local) {
        this.lesson.set(local);
        this.initExerciseState();
      }

      this.api
        .getCurriculum(scriptId)
        .then((res) => {
          const found = res?.units?.flatMap((u) => u.lessons).find((l) => l.id === paramId);
          if (found) {
            this.lesson.set(found as CurriculumLesson);
            if (!local) {
              this.initExerciseState();
            }
          }
        })
        .catch(() => {
          // Local fallback active
        });
    });
  }

  protected selectOption(option: string): void {
    if (this.feedbackState() !== 'idle') return;
    this.selectedAnswer.set(option);
  }

  protected pickToken(token: string, index: number): void {
    if (this.feedbackState() !== 'idle') return;
    const rem = [...this.remainingTokens()];
    rem.splice(index, 1);
    this.remainingTokens.set(rem);
    this.assembledTokens.update((curr) => [...curr, token]);
  }

  protected removeToken(token: string, index: number): void {
    if (this.feedbackState() !== 'idle') return;
    const asm = [...this.assembledTokens()];
    asm.splice(index, 1);
    this.assembledTokens.set(asm);
    this.remainingTokens.update((curr) => [...curr, token]);
  }

  protected checkAnswer(): void {
    const ex = this.currentExercise();
    if (!ex || this.feedbackState() !== 'idle' || this.isCheckDisabled()) return;

    let correct = false;
    if (ex.type === 'WORD_BUILDER') {
      const assembled = this.assembledTokens();
      const target = ex.correctAnswer;
      correct =
        assembled.length === target.length &&
        assembled.every((val, idx) => val === target[idx]);
    } else {
      correct = this.selectedAnswer() === ex.correctAnswer;
    }

    if (correct) {
      this.feedbackState.set('correct');
      this.xpEarned.update((xp) => xp + 5);
    } else {
      this.feedbackState.set('wrong');
      this.hearts.update((h) => Math.max(0, h - 1));
    }
  }

  protected advanceAfterCorrect(): void {
    const total = this.totalExercises();
    if (this.currentIndex() + 1 < total) {
      this.currentIndex.update((i) => i + 1);
      this.initExerciseState();
    } else {
      this.isSessionComplete.set(true);
      const lessonId = this.lesson()?.id ?? this.route.snapshot.paramMap.get('lessonId') ?? '';
      this.progress.recordLessonCompletion(lessonId, this.xpEarned() + 10, this.hearts());
    }
  }

  protected advanceAfterWrong(): void {
    if (this.hearts() <= 0) {
      this.isOutOfHearts.set(true);
      return;
    }
    const total = this.totalExercises();
    if (this.currentIndex() + 1 < total) {
      this.currentIndex.update((i) => i + 1);
      this.initExerciseState();
    } else {
      this.isSessionComplete.set(true);
      const lessonId = this.lesson()?.id ?? this.route.snapshot.paramMap.get('lessonId') ?? '';
      this.progress.recordLessonCompletion(lessonId, this.xpEarned() + 10, this.hearts());
    }
  }

  protected retryLesson(): void {
    this.currentIndex.set(0);
    this.hearts.set(5);
    this.xpEarned.set(0);
    this.isOutOfHearts.set(false);
    this.isSessionComplete.set(false);
    this.initExerciseState();
  }

  protected returnToPath(): void {
    const scriptId = this.ctx.scriptId() ?? 'hy';
    void this.router.navigate(['/', scriptId, 'path']);
  }

  private initExerciseState(): void {
    this.selectedAnswer.set(null);
    this.feedbackState.set('idle');
    const ex = this.currentExercise();
    if (ex && ex.type === 'WORD_BUILDER') {
      this.assembledTokens.set([]);
      this.remainingTokens.set([...ex.tokens]);
    } else {
      this.assembledTokens.set([]);
      this.remainingTokens.set([]);
    }
  }
}
