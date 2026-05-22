import { describe, expect, it } from 'vitest';
import { latinScaffoldForHint, nextHintLevelAfterResult } from './hint-policy';

describe('hint-policy', () => {
  it('level 2 shows full Latin hint', () => {
    expect(latinScaffoldForHint('է', 2, 'ē (eh)')).toBe('ē (eh)');
  });

  it('level 1 shows only first grapheme cluster as teaser', () => {
    expect(latinScaffoldForHint('է', 1, 'ē (eh)')).toBe('ē…');
  });

  it('level 0 hides Latin completely', () => {
    expect(latinScaffoldForHint('է', 0, 'ē (eh)')).toBe('');
  });

  it('after three consecutive correct, hint level steps down until zero', () => {
    expect(nextHintLevelAfterResult(2, true, 2)).toBe(2);
    expect(nextHintLevelAfterResult(2, true, 3)).toBe(1);
    expect(nextHintLevelAfterResult(1, true, 3)).toBe(0);
    expect(nextHintLevelAfterResult(0, true, 99)).toBe(0);
  });

  it('wrong answer resets streak and raises hint toward max', () => {
    expect(nextHintLevelAfterResult(0, false, 3)).toBe(1);
    expect(nextHintLevelAfterResult(1, false, 0)).toBe(2);
    expect(nextHintLevelAfterResult(2, false, 0)).toBe(2);
  });
});
