import { UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import type { JwtVerifier } from './auth.types';

describe('SupabaseAuthGuard', () => {
  it('rejects missing bearer tokens', async () => {
    const guard = new SupabaseAuthGuard({ verify: jest.fn() } satisfies JwtVerifier);

    await expect(guard.canActivate(contextWithHeaders({}))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches verified users to the request', async () => {
    const verifier: JwtVerifier = {
      verify: jest.fn().mockResolvedValue({ id: 'user-1', email: 'user@example.com' }),
    };
    const request = { headers: { authorization: 'Bearer token-1' } };
    const guard = new SupabaseAuthGuard(verifier);

    await expect(guard.canActivate(contextWithRequest(request))).resolves.toBe(true);

    expect(verifier.verify).toHaveBeenCalledWith('token-1');
    expect(request).toEqual({
      headers: { authorization: 'Bearer token-1' },
      user: { id: 'user-1', email: 'user@example.com' },
    });
  });
});

function contextWithHeaders(headers: Record<string, string>) {
  return contextWithRequest({ headers });
}

function contextWithRequest(request: object) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as never;
}
