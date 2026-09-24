import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { isKnownScriptId } from '../../core/script-registry';
import { ProgressService } from '../../services/progress.service';
import { ScriptContextService } from '../../services/script-context.service';
import { PageNavBackController } from '../../services/page-nav-back.controller';
import { PageNav } from '../../ui/page-nav/page-nav';

@Component({
  selector: 'app-script-shell',
  imports: [RouterOutlet, PageNav, RouterLink, RouterLinkActive],
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
  template: `
    <header
      class="shrink-0 border-b border-neutral-200 bg-neutral-50/95 px-3 pb-3 pt-2 backdrop-blur-sm sm:px-4"
    >
      <app-page-nav />
      <nav
        class="mx-auto mt-2 flex max-w-md items-center justify-center gap-1 rounded-xl bg-neutral-200/60 p-1 text-xs font-semibold"
        aria-label="Script sections"
      >
        <a
          routerLink="./path"
          routerLinkActive="bg-white text-neutral-900 shadow-xs"
          class="flex-1 rounded-lg px-3 py-1.5 text-center text-neutral-600 transition-colors hover:text-neutral-900"
        >
          Learning Path
        </a>
        <a
          routerLink="./learn/0"
          routerLinkActive="bg-white text-neutral-900 shadow-xs"
          class="flex-1 rounded-lg px-3 py-1.5 text-center text-neutral-600 transition-colors hover:text-neutral-900"
        >
          Alphabet Reference
        </a>
        <a
          routerLink="./session"
          routerLinkActive="bg-white text-neutral-900 shadow-xs"
          class="flex-1 rounded-lg px-3 py-1.5 text-center text-neutral-600 transition-colors hover:text-neutral-900"
        >
          Practice Quiz
        </a>
      </nav>
    </header>
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <router-outlet />
    </div>
  `,
  providers: [ScriptContextService, ProgressService, PageNavBackController],
})
export class ScriptShell {
  private readonly router = inject(Router);
  private readonly ctx = inject(ScriptContextService);

  constructor() {
    effect(() => {
      const id = this.ctx.scriptId();
      if (id && !isKnownScriptId(id)) {
        void this.router.navigate(['/']);
      }
    });
  }
}
