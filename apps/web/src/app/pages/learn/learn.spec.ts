import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { of } from 'rxjs';
import { HY_SCRIPT } from '../../core/scripts/hy.script';
import { PageNavBackController } from '../../services/page-nav-back.controller';
import { ScriptContextService } from '../../services/script-context.service';
import { Learn } from './learn';

describe('Learn', () => {
  beforeEach(async () => {
    const ctx = {
      scriptId: signal<string | undefined>('hy'),
      definition: signal(HY_SCRIPT),
    } as unknown as ScriptContextService;
    await TestBed.configureTestingModule({
      imports: [Learn],
      providers: [
        { provide: Location, useValue: { back: vi.fn() } },
        PageNavBackController,
        { provide: Router, useValue: { navigate: vi.fn(() => Promise.resolve(true)) } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ stepIndex: '0' })),
            snapshot: { paramMap: convertToParamMap({ stepIndex: '0' }) },
          },
        },
        { provide: ScriptContextService, useValue: ctx },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Learn);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
