import { ProgressResponseSchema, UpsertProgressRequestSchema } from './progress-contracts';

describe('progress contracts', () => {
  it('accepts light v2 progress without per-letter validation', () => {
    expect(
      UpsertProgressRequestSchema.parse({
        progress: {
          version: 2,
          letters: {
            anything: { arbitrary: true },
          },
        },
      }),
    ).toEqual({
      progress: {
        version: 2,
        letters: {
          anything: { arbitrary: true },
        },
      },
    });
  });

  it('rejects non-v2 or null letters payloads', () => {
    expect(() => UpsertProgressRequestSchema.parse({ progress: { version: 1, letters: {} } })).toThrow();
    expect(() => UpsertProgressRequestSchema.parse({ progress: { version: 2, letters: null } })).toThrow();
  });

  it('allows missing remote progress in per-script responses', () => {
    expect(
      ProgressResponseSchema.parse({
        scriptId: 'hy',
        progress: null,
        updatedAt: null,
      }),
    ).toEqual({
      scriptId: 'hy',
      progress: null,
      updatedAt: null,
    });
  });
});
