import { Module } from '@nestjs/common';
import { JWT_VERIFIER } from './auth.types';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SupabaseJwtVerifier } from './supabase-jwt.verifier';

@Module({
  providers: [
    SupabaseAuthGuard,
    SupabaseJwtVerifier,
    {
      provide: JWT_VERIFIER,
      useExisting: SupabaseJwtVerifier,
    },
  ],
  exports: [SupabaseAuthGuard, JWT_VERIFIER],
})
export class AuthModule {}
