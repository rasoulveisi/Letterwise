import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home, RouterModule.forRoot([])],
    }).compileComponents();
  });

  it('should show script choices', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Letterwise');
    expect(el.textContent).toContain('Armenian');
  });
});
