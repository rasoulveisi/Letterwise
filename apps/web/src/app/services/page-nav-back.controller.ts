import { Injectable, inject } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Lets the learn flow override the global Back control (previous step) while falling back to
 * browser history elsewhere.
 */
@Injectable()
export class PageNavBackController {
  private readonly location = inject(Location);
  private handler: (() => void) | null = null;

  setOverride(handler: (() => void) | null): void {
    this.handler = handler;
  }

  goBack(): void {
    if (this.handler) {
      this.handler();
      return;
    }
    this.location.back();
  }
}
