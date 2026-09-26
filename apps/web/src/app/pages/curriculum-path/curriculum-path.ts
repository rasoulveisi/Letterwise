import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ARMENIAN_CURRICULUM, type CurriculumLesson, type CurriculumUnit } from '@letterwise/scripts/domain';
import { ProgressApiClient } from '../../services/progress-api.client';
import { ProgressService } from '../../services/progress.service';
import { ScriptContextService } from '../../services/script-context.service';

@Component({
  selector: 'app-curriculum-path',
  imports: [RouterLink],
  template: `
    <div class="shrink-0 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div
        class="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-2 shadow-xs"
      >
        <div class="flex items-center gap-1.5 font-bold text-amber-600">
          <span class="text-lg" aria-hidden="true">🔥</span>
          <span class="text-sm font-semibold">{{ progress.streakCount() }}</span>
        </div>
        <div class="h-4 w-px bg-neutral-200"></div>
        <div class="flex items-center gap-1.5 font-bold text-amber-500">
          <span class="text-lg" aria-hidden="true">⚡</span>
          <span class="text-sm font-semibold">{{ progress.xp() }} XP</span>
        </div>
        <div class="h-4 w-px bg-neutral-200"></div>
        <div class="flex items-center gap-1.5 font-bold text-rose-500">
          <span class="text-lg" aria-hidden="true">❤️</span>
          <span class="text-sm font-semibold">{{ progress.hearts() }}</span>
        </div>
      </div>

      <nav
        class="mx-auto mt-3 flex max-w-md items-center justify-center gap-1 rounded-xl bg-neutral-200/70 p-1 text-xs font-semibold"
      >
        <span class="flex-1 rounded-lg bg-white py-1.5 text-center text-neutral-900 shadow-xs">
          Learning Path
        </span>
        <a
          [routerLink]="['/', ctx.scriptId() || 'hy', 'learn', '0']"
          class="flex-1 rounded-lg py-1.5 text-center text-neutral-600 transition hover:text-neutral-900"
        >
          Alphabet Chart
        </a>
        <a
          [routerLink]="['/', ctx.scriptId() || 'hy', 'session']"
          class="flex-1 rounded-lg py-1.5 text-center text-neutral-600 transition hover:text-neutral-900"
        >
          Practice Quiz
        </a>
      </nav>
    </div>

    <main class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
      <div class="mx-auto flex max-w-md flex-col gap-8 pb-12">
        @for (unit of units(); track unit.id; let uIdx = $index) {
          <section class="flex flex-col items-center">
            <div
              class="w-full rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 text-white shadow-md"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span
                    class="inline-block rounded-md bg-neutral-700/80 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Unit {{ unit.orderIndex }}
                  </span>
                  <h2 class="mt-1 text-lg font-bold leading-tight">{{ unit.title }}</h2>
                  <p class="mt-1 text-xs text-neutral-300">{{ unit.description }}</p>
                </div>
                @if (isUnitCompleted(unit)) {
                  <span
                    class="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                  >
                    Completed ✓
                  </span>
                } @else if (isUnitUnlocked(unit)) {
                  <span
                    class="shrink-0 rounded-full border border-blue-500/40 bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300"
                  >
                    In Progress
                  </span>
                } @else {
                  <span
                    class="shrink-0 rounded-full border border-neutral-600 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-400"
                  >
                    Locked 🔒
                  </span>
                }
              </div>
            </div>

            @if (unit.lessons.length > 0) {
              <div class="mt-6 flex flex-col items-center">
                @for (lesson of unit.lessons; track lesson.id; let lIdx = $index) {
                  @if (lIdx > 0) {
                    <div
                      class="h-7 w-1 transition-colors duration-200"
                      [class.bg-emerald-400]="isLessonCompleted(lesson.id)"
                      [class.bg-blue-300]="isLessonCurrent(lesson.id)"
                      [class.bg-neutral-200]="!isLessonUnlocked(lesson.id)"
                    ></div>
                  }

                  <div class="flex flex-col items-center">
                    <button
                      type="button"
                      [disabled]="!isLessonUnlocked(lesson.id)"
                      (click)="onNodeClick(lesson)"
                      [attr.aria-label]="lesson.title"
                      class="relative flex h-[4.5rem] w-[4.5rem] touch-manipulation items-center justify-center rounded-full border-4 shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
                      [class.bg-emerald-500]="isLessonCompleted(lesson.id)"
                      [class.border-emerald-600]="isLessonCompleted(lesson.id)"
                      [class.text-white]="isLessonCompleted(lesson.id)"
                      [class.hover:scale-105]="isLessonUnlocked(lesson.id)"
                      [class.active:scale-95]="isLessonUnlocked(lesson.id)"
                      [class.bg-blue-600]="isLessonCurrent(lesson.id)"
                      [class.border-blue-400]="isLessonCurrent(lesson.id)"
                      [class.text-white]="isLessonCurrent(lesson.id)"
                      [class.ring-4]="isLessonCurrent(lesson.id)"
                      [class.ring-blue-300/50]="isLessonCurrent(lesson.id)"
                      [class.bg-neutral-100]="!isLessonUnlocked(lesson.id)"
                      [class.border-neutral-300]="!isLessonUnlocked(lesson.id)"
                      [class.text-neutral-400]="!isLessonUnlocked(lesson.id)"
                      [class.cursor-not-allowed]="!isLessonUnlocked(lesson.id)"
                    >
                      @if (isLessonCompleted(lesson.id)) {
                        <span class="text-2xl font-black">✓</span>
                      } @else if (isLessonCurrent(lesson.id)) {
                        <span class="text-2xl font-bold">★</span>
                      } @else {
                        <span class="text-xl" aria-hidden="true">🔒</span>
                      }
                    </button>
                    <span
                      class="mt-2 max-w-[9rem] text-center text-xs font-semibold leading-tight"
                      [class.text-neutral-900]="isLessonUnlocked(lesson.id)"
                      [class.text-neutral-400]="!isLessonUnlocked(lesson.id)"
                    >
                      {{ lesson.title }}
                    </span>
                  </div>
                }
              </div>
            }
          </section>
        }
      </div>
    </main>
  `,
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
})
export class CurriculumPath {
  private readonly router = inject(Router);
  protected readonly ctx = inject(ScriptContextService);
  protected readonly progress = inject(ProgressService);
  private readonly api = inject(ProgressApiClient);

  protected readonly units = signal<readonly CurriculumUnit[]>(
    this.ctx.scriptId() === 'hy' ? ARMENIAN_CURRICULUM : [],
  );

  protected readonly allLessons = computed(() => this.units().flatMap((u) => u.lessons));

  constructor() {
    effect(() => {
      const scriptId = this.ctx.scriptId();
      if (!scriptId) return;

      if (scriptId === 'hy') {
        this.units.set(ARMENIAN_CURRICULUM);
      }

      this.api
        .getCurriculum(scriptId)
        .then((res) => {
          if (res?.units && res.units.length > 0) {
            this.units.set(res.units as readonly CurriculumUnit[]);
          }
        })
        .catch(() => {
          // Seamless fallback
        });
    });
  }

  protected isLessonCompleted(lessonId: string): boolean {
    return this.progress.completedLessons().includes(lessonId);
  }

  protected isLessonUnlocked(lessonId: string): boolean {
    const list = this.allLessons();
    const idx = list.findIndex((l) => l.id === lessonId);
    if (idx <= 0) return true;
    const prev = list[idx - 1];
    return prev ? this.isLessonCompleted(prev.id) : false;
  }

  protected isLessonCurrent(lessonId: string): boolean {
    return this.isLessonUnlocked(lessonId) && !this.isLessonCompleted(lessonId);
  }

  protected isUnitCompleted(unit: CurriculumUnit): boolean {
    if (!unit.lessons.length) return false;
    return unit.lessons.every((l) => this.isLessonCompleted(l.id));
  }

  protected isUnitUnlocked(unit: CurriculumUnit): boolean {
    if (!unit.lessons.length) return false;
    const firstLesson = unit.lessons[0];
    return firstLesson ? this.isLessonUnlocked(firstLesson.id) : false;
  }

  protected isUnit1Completed(): boolean {
    const unit1 = this.units()[0];
    if (!unit1 || unit1.lessons.length === 0) return false;
    return unit1.lessons.every((l) => this.isLessonCompleted(l.id));
  }

  protected onNodeClick(lesson: CurriculumLesson): void {
    if (!this.isLessonUnlocked(lesson.id)) return;
    const scriptId = this.ctx.scriptId() ?? 'hy';
    void this.router.navigate(['/', scriptId, 'lesson', lesson.id]);
  }
}
