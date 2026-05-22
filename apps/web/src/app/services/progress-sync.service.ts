import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { mergeProgressV2, progressV2Equals, type AppProgressV2 } from '@letterwise/progress/domain';
import { AuthService } from './auth.service';
import { ProgressApiClient } from './progress-api.client';
import { ProgressRepository } from './progress.repository';

export type SyncStatus = 'local' | 'offline' | 'pending' | 'syncing' | 'saved' | 'error';

@Injectable({ providedIn: 'root' })
export class ProgressSyncService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ProgressApiClient);
  private readonly repository = inject(ProgressRepository);
  private readonly pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private activeScriptId?: string;

  readonly status = signal<SyncStatus>('local');
  readonly statusLabel = computed(() => {
    const labels: Record<SyncStatus, string> = {
      local: 'Local',
      offline: 'Offline',
      pending: 'Pending',
      syncing: 'Syncing',
      saved: 'Saved',
      error: 'Pending',
    };
    return labels[this.status()];
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    globalThis.addEventListener?.('online', () => void this.syncActiveFirst());
    globalThis.addEventListener?.('offline', () => this.status.set('offline'));

    effect(() => {
      if (this.auth.signedIn()) {
        void this.syncActiveFirst();
      } else {
        this.status.set(globalThis.navigator?.onLine === false ? 'offline' : 'local');
      }
    });
  }

  setActiveScript(scriptId: string | undefined): void {
    this.activeScriptId = scriptId;
    if (scriptId && this.auth.signedIn()) {
      void this.syncScript(scriptId);
    }
  }

  schedulePush(scriptId: string): void {
    if (!this.auth.signedIn()) {
      return;
    }
    this.status.set(globalThis.navigator?.onLine === false ? 'offline' : 'pending');
    const existing = this.pushTimers.get(scriptId);
    if (existing) {
      clearTimeout(existing);
    }
    this.pushTimers.set(
      scriptId,
      setTimeout(() => void this.pushScript(scriptId), 700),
    );
  }

  async syncActiveFirst(): Promise<void> {
    if (!this.auth.signedIn() || globalThis.navigator?.onLine === false) {
      this.status.set(this.auth.signedIn() ? 'offline' : 'local');
      return;
    }

    if (this.activeScriptId) {
      await this.syncScript(this.activeScriptId);
    }

    for (const scriptId of this.repository.knownLocalScriptIds()) {
      if (scriptId !== this.activeScriptId) {
        void this.syncScript(scriptId);
      }
    }
  }

  async syncScript(scriptId: string): Promise<void> {
    if (!this.auth.signedIn()) {
      return;
    }
    this.status.set('syncing');
    try {
      const local = this.repository.loadForSync(scriptId);
      const remote = await this.api.getProgress(scriptId);
      const merged = mergeProgressV2(remote.progress as AppProgressV2 | null, local);
      this.repository.saveCanonical(scriptId, merged);
      if (!progressV2Equals(remote.progress as AppProgressV2 | null, merged)) {
        await this.pushScript(scriptId);
        return;
      }
      this.status.set('saved');
    } catch {
      this.status.set(globalThis.navigator?.onLine === false ? 'offline' : 'error');
    }
  }

  private async pushScript(scriptId: string): Promise<void> {
    if (!this.auth.signedIn()) {
      return;
    }
    this.status.set('syncing');
    try {
      const local = this.repository.loadForSync(scriptId);
      const saved = await this.api.putProgress(scriptId, local);
      if (saved.progress) {
        this.repository.saveCanonical(scriptId, saved.progress as AppProgressV2);
      }
      this.status.set('saved');
    } catch {
      this.status.set(globalThis.navigator?.onLine === false ? 'offline' : 'error');
    }
  }
}
