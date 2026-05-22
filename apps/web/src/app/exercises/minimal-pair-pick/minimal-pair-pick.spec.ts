import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { MinimalPairPick } from './minimal-pair-pick';

describe('MinimalPairPick', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimalPairPick],
    }).compileComponents();
  });

  it('emits chosen letter when clicking first glyph button', () => {
    const fixture = TestBed.createComponent(MinimalPairPick);
    fixture.componentRef.setInput('glyphs', ['է', 'ե'] as const);
    fixture.componentRef.setInput('targetLetter', 'է');
    fixture.componentRef.setInput('latinFull', 'ē (eh)');
    fixture.componentRef.setInput('hintLevel', 2);
    let out = '';
    fixture.componentInstance.chosen.subscribe((c) => (out = c));
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button[type="button"]');
    (buttons[0] as HTMLButtonElement).click();
    expect(out).toBe('է');
  });
});
