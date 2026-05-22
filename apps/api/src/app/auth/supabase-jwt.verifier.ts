import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthenticatedUser, JwtVerifier } from './auth.types';

@Injectable()
export class SupabaseJwtVerifier implements JwtVerifier {
  private jwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly config: ConfigService) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    const jwksUrl = this.config.get<string>('SUPABASE_JWKS_URL');
    if (!jwksUrl) {
      throw new UnauthorizedException('SUPABASE_JWKS_URL is not configured');
    }

    try {
      this.jwks ??= createRemoteJWKSet(new URL(jwksUrl));
      const { payload } = await jwtVerify(token, this.jwks);
      const subject = payload.sub;
      if (!subject) {
        throw new UnauthorizedException('Token is missing subject');
      }
      const email = payload['email'];
      return { id: subject, email: typeof email === 'string' ? email : undefined };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid bearer token');
    }
  }
}
