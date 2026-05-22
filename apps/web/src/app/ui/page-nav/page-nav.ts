import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PageNavBackController } from '../../services/page-nav-back.controller';
import { ProgressSyncService } from '../../services/progress-sync.service';

@Component({
  selector: 'app-page-nav',
  imports: [RouterLink],
  template: `
    <nav
      class="mx-auto grid w-full max-w-md grid-cols-[auto_1fr_auto] items-center gap-2"
      aria-label="Page"
    >
      <button
        type="button"
        class="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none transition-colors active:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        (click)="goBack()"
        aria-label="Go back"
      >
        Back
      </button>
      <a
        routerLink="/"
        class="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-lg border border-neutral-900 bg-neutral-900 px-3 text-sm font-semibold text-white outline-none transition-colors active:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        aria-label="Letterwise home — choose a script"
      >
        Home
      </a>
      <button
        type="button"
        class="inline-flex min-h-11 min-w-[5.25rem] items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-800 outline-none transition-colors active:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        (click)="toggleAuth()"
      >
        {{ auth.signedIn() ? sync.statusLabel() : 'Sign in' }}
      </button>
    </nav>
  `,
})
export class PageNav {
  private readonly location = inject(Location);
  private readonly navBack = inject(PageNavBackController, { optional: true });
  protected readonly auth = inject(AuthService);
  protected readonly sync = inject(ProgressSyncService);

  protected goBack(): void {
    if (this.navBack) {
      this.navBack.goBack();
      return;
    }
    this.location.back();
  }

  protected toggleAuth(): void {
    if (this.auth.signedIn()) {
      void this.auth.signOut();
      return;
    }
    void this.auth.signInWithGoogle();
  }
}
