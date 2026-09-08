import { signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import type { AppProgressV2 } from '@letterwise/progress/domain';
import { AuthService } from './auth.service';
import { ProgressApiClient } from './progress-api.client';
import { ProgressRepository } from './progress.repository';
import { ProgressSyncService } from './progress-sync.service';

describe('ProgressSyncService', () => {
  const localProgress: AppProgressV2 = {
    version: 2,
    letters: {
      ա: { hintLevel: 0, consecutiveCorrect: 1, wrongAnswers: 0, updatedAtMs: 10 },
    },
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function setupService({
    signedIn,
    api,
    repository,
  }: {
    signedIn: boolean;
    api: Partial<ProgressApiClient>;
    repository: Partial<ProgressRepository>;
  }) {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: { signedIn: signal(signedIn) } },
        { provide: ProgressApiClient, useValue: api },
        { provide: ProgressRepository, useValue: repository },
        ProgressSyncService,
      ],
    });

    return TestBed.inject(ProgressSyncService);
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not trigger sync for guest users', async () => {
    const getProgress = vi.fn();
    const putProgress = vi.fn();
    const loadForSync = vi.fn();
    const saveCanonical = vi.fn();

    const svc = setupService({
      signedIn: false,
      api: { getProgress, putProgress },
      repository: {
        knownLocalScriptIds: vi.fn(() => []),
        loadForSync,
        saveCanonical,
      } as unknown as Partial<ProgressRepository>,
    });

    svc.setActiveScript('hy');
    svc.schedulePush('hy');

    expect(getProgress).not.toHaveBeenCalled();
    expect(putProgress).not.toHaveBeenCalled();
    expect(loadForSync).not.toHaveBeenCalled();
    expect(saveCanonical).not.toHaveBeenCalled();
    expect(svc.status()).toBe('local');
  });

  it('syncs active script for signed-in users', async () => {
    const api = {
      getProgress: vi.fn().mockResolvedValue({
        scriptId: 'hy',
        progress: localProgress,
        updatedAt: new Date().toISOString(),
      }),
      putProgress: vi.fn().mockResolvedValue({ scriptId: 'hy', progress: localProgress, updatedAt: new Date().toISOString() }),
    };
    const loadForSync = vi.fn().mockReturnValue(localProgress);
    const saveCanonical = vi.fn();

    const svc = setupService({
      signedIn: true,
      api,
      repository: {
        knownLocalScriptIds: vi.fn(() => []),
        loadForSync,
        saveCanonical,
      } as unknown as Partial<ProgressRepository>,
    });

    await svc.syncScript('hy');

    expect(api.getProgress).toHaveBeenCalledWith('hy');
    expect(loadForSync).toHaveBeenCalledWith('hy');
    expect(saveCanonical).toHaveBeenCalledWith('hy', localProgress);
    expect(api.putProgress).not.toHaveBeenCalled();
    expect(svc.status()).toBe('saved');
  });
});
