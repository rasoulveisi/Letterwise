import {
  createMonotonicTimestamp,
  mergeProgressV2,
  migrateV1ToV2,
  progressV2Equals,
  type AppProgressV2,
} from './progress-domain';

const remote: AppProgressV2 = {
  version: 2,
  letters: {
    ա: { hintLevel: 1, consecutiveCorrect: 2, wrongAnswers: 0, updatedAtMs: 10 },
  },
};

describe('progress domain', () => {
  it('lets the higher updatedAtMs win per letter', () => {
    const local: AppProgressV2 = {
      version: 2,
      letters: {
        ա: { hintLevel: 0, consecutiveCorrect: 5, wrongAnswers: 1, updatedAtMs: 11 },
      },
    };

    expect(mergeProgressV2(remote, local).letters['ա']).toEqual(local.letters['ա']);
  });

  it('prefers remote when timestamps tie or one side is missing a timestamp', () => {
    const tied: AppProgressV2 = {
      version: 2,
      letters: {
        ա: { hintLevel: 0, consecutiveCorrect: 5, wrongAnswers: 1, updatedAtMs: 10 },
        բ: { hintLevel: 0, consecutiveCorrect: 1, wrongAnswers: 0, updatedAtMs: 20 },
      },
    };

    const merged = mergeProgressV2(
      {
        version: 2,
        letters: {
          ...remote.letters,
          բ: { hintLevel: 2, consecutiveCorrect: 0, wrongAnswers: 4 } as never,
        },
      },
      tied,
    );

    expect(merged.letters['ա']).toEqual(remote.letters['ա']);
    expect(merged.letters['բ']).toEqual({ hintLevel: 2, consecutiveCorrect: 0, wrongAnswers: 4 });
  });

  it('prefers local when both entries are legacy during migration', () => {
    const merged = mergeProgressV2(
      {
        version: 2,
        letters: {
          ա: { hintLevel: 2, consecutiveCorrect: 0, wrongAnswers: 2 } as never,
        },
      },
      {
        version: 2,
        letters: {
          ա: { hintLevel: 0, consecutiveCorrect: 3, wrongAnswers: 0 } as never,
        },
      },
    );

    expect(merged.letters['ա']).toEqual({ hintLevel: 0, consecutiveCorrect: 3, wrongAnswers: 0 });
  });

  it('migrates v1 with a fixed timestamp', () => {
    expect(
      migrateV1ToV2(
        {
          version: 1,
          letters: { ա: { hintLevel: 1, consecutiveCorrect: 2, wrongAnswers: 3 } },
        },
        123,
      ),
    ).toEqual({
      version: 2,
      letters: { ա: { hintLevel: 1, consecutiveCorrect: 2, wrongAnswers: 3, updatedAtMs: 123 } },
    });
  });

  it('creates timestamps that never go backward', () => {
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(99).mockReturnValueOnce(101);
    const next = createMonotonicTimestamp(now);

    expect([next(), next(), next()]).toEqual([100, 101, 102]);
  });

  it('compares v2 progress deterministically regardless of key order', () => {
    expect(
      progressV2Equals(
        { version: 2, letters: { ա: remote.letters['ա'], բ: { ...remote.letters['ա'], updatedAtMs: 20 } } },
        { version: 2, letters: { բ: { ...remote.letters['ա'], updatedAtMs: 20 }, ա: remote.letters['ա'] } },
      ),
    ).toBe(true);
    expect(progressV2Equals(remote, { version: 2, letters: {} })).toBe(false);
  });
});
