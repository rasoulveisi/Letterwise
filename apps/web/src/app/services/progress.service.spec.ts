import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { PLATFORM_ID } from '@angular/core';
import { HY_SCRIPT } from '../core/scripts/hy.script';
import { ProgressService } from './progress.service';
import { progressStorageKey } from '../core/progress-storage';
import { ScriptContextService } from './script-context.service';
import { ProgressSyncService } from './progress-sync.service';

describe('ProgressService', () => {
  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  beforeEach(() => {
    const ctx = {
      scriptId: signal<string | undefined>('hy'),
      definition: signal(HY_SCRIPT),
    } as unknown as ScriptContextService;
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ScriptContextService, useValue: ctx },
        {
          provide: ProgressSyncService,
          useValue: {
            setActiveScript: () => undefined,
            schedulePush: () => undefined,
          },
        },
        ProgressService,
      ],
    });
  });

  it('loads empty state when storage empty', () => {
    const svc = TestBed.inject(ProgressService);
    expect(svc.state().letters).toEqual({});
  });

  it('recordLetterOutcome updates hint and streak', () => {
    const svc = TestBed.inject(ProgressService);
    svc.recordLetterOutcome('է', { correct: true, nextStreak: 3, nextHintLevel: 1 });
    expect(svc.state().letters['է']?.hintLevel).toBe(1);
    expect(svc.state().letters['է']?.consecutiveCorrect).toBe(3);
  });

  it('persists to localStorage when browser', () => {
    const svc = TestBed.inject(ProgressService);
    svc.recordLetterOutcome('ե', { correct: false, nextStreak: 0, nextHintLevel: 2 });
    const raw = localStorage.getItem(progressStorageKey('hy'));
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).letters['ե'].wrongAnswers).toBeGreaterThanOrEqual(1);
  });
});
