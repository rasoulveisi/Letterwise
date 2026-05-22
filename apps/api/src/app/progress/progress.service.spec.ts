import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import type { SupabaseClientFactory } from '../supabase/supabase-client.factory';

describe('ProgressService', () => {
  it('rejects unknown script ids', async () => {
    const service = new ProgressService(factoryWithClient({}));

    await expect(service.getOne('token', 'user-1', 'nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns null progress for missing rows', async () => {
    const service = new ProgressService(factoryWithClient(createClient({ maybeSingle: { data: null, error: null } })));

    await expect(service.getOne('token', 'user-1', 'hy')).resolves.toEqual({
      scriptId: 'hy',
      progress: null,
      updatedAt: null,
    });
  });

  it('filters bulk rows to known scripts and validates stored progress', async () => {
    const client = createClient({
      select: {
        data: [
          {
            user_id: 'user-1',
            script_id: 'hy',
            progress: progress(10),
            updated_at: '2026-05-21T00:00:00.000Z',
          },
          {
            user_id: 'user-1',
            script_id: 'ignored',
            progress: progress(11),
            updated_at: '2026-05-21T00:00:00.000Z',
          },
        ],
        error: null,
      },
    });
    const service = new ProgressService(factoryWithClient(client));

    await expect(service.getAll('token', 'user-1')).resolves.toEqual({
      items: [
        {
          scriptId: 'hy',
          progress: progress(10),
          updatedAt: '2026-05-21T00:00:00.000Z',
        },
      ],
    });
  });

  it('rejects malformed stored rows', async () => {
    const service = new ProgressService(
      factoryWithClient(createClient({ maybeSingle: { data: { progress: { version: 1 }, updated_at: 'now' }, error: null } })),
    );

    await expect(service.getOne('token', 'user-1', 'hy')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('rejects invalid incoming payloads', async () => {
    const service = new ProgressService(factoryWithClient(createClient({ maybeSingle: { data: null, error: null } })));

    await expect(service.upsert('token', 'user-1', 'hy', { progress: { version: 1, letters: {} } })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('server-merges incoming progress with remote before upsert', async () => {
    const remote = {
      user_id: 'user-1',
      script_id: 'hy',
      progress: progress(20, 1),
      updated_at: 'remote-date',
    };
    const client = createClient({
      maybeSingle: { data: remote, error: null },
      single: {
        data: {
          user_id: 'user-1',
          script_id: 'hy',
          progress: {
            version: 2,
            letters: {
              ա: { hintLevel: 1, consecutiveCorrect: 1, wrongAnswers: 0, updatedAtMs: 20 },
              բ: { hintLevel: 0, consecutiveCorrect: 3, wrongAnswers: 1, updatedAtMs: 30 },
            },
          },
          updated_at: 'saved-date',
        },
        error: null,
      },
    });
    const service = new ProgressService(factoryWithClient(client));

    const response = await service.upsert('token', 'user-1', 'hy', {
      progress: {
        version: 2,
        letters: {
          ա: { hintLevel: 0, consecutiveCorrect: 9, wrongAnswers: 9, updatedAtMs: 10 },
          բ: { hintLevel: 0, consecutiveCorrect: 3, wrongAnswers: 1, updatedAtMs: 30 },
        },
      },
    });

    expect(client.lastUpsert.progress).toEqual(response.progress);
    expect(response.updatedAt).toBe('saved-date');
  });
});

function progress(updatedAtMs: number, consecutiveCorrect = 1) {
  return {
    version: 2,
    letters: {
      ա: { hintLevel: 1, consecutiveCorrect, wrongAnswers: 0, updatedAtMs },
    },
  };
}

function factoryWithClient(client: object): SupabaseClientFactory {
  return {
    forUserToken: jest.fn().mockReturnValue(client),
  } as never;
}

function createClient(results: {
  maybeSingle?: { data: unknown; error: { message: string } | null };
  select?: { data: unknown; error: { message: string } | null };
  single?: { data: unknown; error: { message: string } | null };
}) {
  const client = {
    lastUpsert: undefined as never,
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn(function () {
      return results.select;
    }),
    maybeSingle: jest.fn(() => results.maybeSingle),
    upsert: jest.fn(function (this: typeof client, payload: never) {
      this.lastUpsert = payload;
      return this;
    }),
    single: jest.fn(() => results.single),
  };

  return client;
}
