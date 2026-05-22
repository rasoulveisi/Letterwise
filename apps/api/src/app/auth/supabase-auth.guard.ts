import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest, JwtVerifier } from './auth.types';
import { JWT_VERIFIER } from './auth.types';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(@Inject(JWT_VERIFIER) private readonly verifier: JwtVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers['authorization'];
    const header = Array.isArray(authorization) ? authorization[0] : authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    request.user = await this.verifier.verify(header.slice('Bearer '.length).trim());
    return true;
  }
}
