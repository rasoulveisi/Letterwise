import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { isKnownScriptId } from '../../core/script-registry';
import { ProgressService } from '../../services/progress.service';
import { ScriptContextService } from '../../services/script-context.service';
import { PageNavBackController } from '../../services/page-nav-back.controller';
import { PageNav } from '../../ui/page-nav/page-nav';

@Component({
  selector: 'app-script-shell',
  imports: [RouterOutlet, PageNav],
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
  template: `
    <header
      class="shrink-0 border-b border-neutral-200 bg-neutral-50/95 px-3 pb-3 pt-2 backdrop-blur-sm sm:px-4"
    >
      <app-page-nav />
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
