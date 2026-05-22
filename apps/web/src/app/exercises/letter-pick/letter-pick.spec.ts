import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { LetterPick } from './letter-pick';

describe('LetterPick', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterPick],
    }).compileComponents();
  });

  it('emits chosen letter', () => {
    const fixture = TestBed.createComponent(LetterPick);
    fixture.componentRef.setInput('targetLetter', 'է');
    fixture.componentRef.setInput('latinFull', 'ē (eh)');
    fixture.componentRef.setInput('hintLevel', 2);
    fixture.componentRef.setInput('options', ['է', 'ե', 'ի', 'վ']);
    let out = '';
    fixture.componentInstance.chosen.subscribe((c) => (out = c));
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button[type="button"]');
    (buttons[0] as HTMLButtonElement).click();
    expect(out).toBe('է');
  });
});
