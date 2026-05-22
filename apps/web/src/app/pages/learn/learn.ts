import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { buildLearnSteps, learnSequenceRng } from '../../core/learn-sequence';
import { LetterPick } from '../../exercises/letter-pick/letter-pick';
import { PageNavBackController } from '../../services/page-nav-back.controller';
import { ScriptContextService } from '../../services/script-context.service';

@Component({
  selector: 'app-learn',
  imports: [LetterPick, RouterLink],
  templateUrl: './learn.html',
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
})
export class Learn {
  protected readonly ctx = inject(ScriptContextService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly navBack = inject(PageNavBackController);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stepParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('stepIndex'))),
    { initialValue: this.route.snapshot.paramMap.get('stepIndex') ?? '0' },
  );

  protected readonly steps = computed(() => {
    const def = this.ctx.definition();
    const id = this.ctx.scriptId();
    return def && id ? buildLearnSteps(def, learnSequenceRng(id)) : [];
  });

  protected readonly alphabet = computed(() => this.ctx.definition()?.alphabet ?? []);

  protected readonly parsedStepIndex = computed(() => {
    const raw = this.stepParam();
    const n = Number.parseInt(String(raw), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });

  protected readonly current = computed(() => {
    const steps = this.steps();
    const i = this.parsedStepIndex();
    if (!steps.length || i >= steps.length) {
      return null;
    }
    return steps[i] ?? null;
  });

  protected readonly done = computed(() => {
    const steps = this.steps();
    const i = this.parsedStepIndex();
    return steps.length > 0 && i >= steps.length;
  });

  protected readonly stepLabel = computed(() => {
    const steps = this.steps();
    const i = this.parsedStepIndex();
    const total = steps.length;
    if (!total) {
      return '0 / 0';
    }
    if (i >= total) {
      return `${total} / ${total}`;
    }
    return `${i + 1} / ${total}`;
  });

  protected readonly showWrong = signal(false);

  constructor() {
    effect(() => {
      const id = this.ctx.scriptId();
      const steps = this.steps();
      const i = this.parsedStepIndex();
      if (!id || !steps.length) {
        return;
      }
      const maxDone = steps.length;
      if (i < 0) {
        void this.router.navigate(['/', id, 'learn', 0], { replaceUrl: true });
        return;
      }
      if (i > maxDone) {
        void this.router.navigate(['/', id, 'learn', maxDone], { replaceUrl: true });
      }
    });

    effect(() => {
      const id = this.ctx.scriptId();
      const steps = this.steps();
      const i = this.parsedStepIndex();
      if (!id || !steps.length) {
        this.navBack.setOverride(null);
        return;
      }
      if (i > 0) {
        this.navBack.setOverride(() => {
          void this.router.navigate(['/', id, 'learn', i - 1], { replaceUrl: true });
        });
      } else {
        this.navBack.setOverride(null);
      }
    });

    this.destroyRef.onDestroy(() => this.navBack.setOverride(null));
  }

  private goToStep(n: number): void {
    const id = this.ctx.scriptId();
    if (!id) {
      return;
    }
    void this.router.navigate(['/', id, 'learn', n], { replaceUrl: true });
  }

  protected nextFromIntro(): void {
    this.showWrong.set(false);
    this.goToStep(this.parsedStepIndex() + 1);
  }

  protected onLearnMatch(letter: string, correct: boolean): void {
    if (correct) {
      this.showWrong.set(false);
      this.goToStep(this.parsedStepIndex() + 1);
      return;
    }
    this.showWrong.set(true);
  }
}
