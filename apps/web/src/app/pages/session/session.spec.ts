import { signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HY_SCRIPT } from '../../core/scripts/hy.script';
import { ProgressService } from '../../services/progress.service';
import { ScriptContextService } from '../../services/script-context.service';
import { Session } from './session';

describe('Session', () => {
  beforeEach(async () => {
    const ctx = {
      scriptId: signal<string | undefined>('hy'),
      definition: signal(HY_SCRIPT),
    } as unknown as ScriptContextService;
    await TestBed.configureTestingModule({
      imports: [Session],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ScriptContextService, useValue: ctx },
        ProgressService,
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(Session);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
