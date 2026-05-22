import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { ProgressService } from './progress.service';

@UseGuards(SupabaseAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getAll(@Req() request: AuthenticatedRequest) {
    return this.progressService.getAll(this.accessToken(request), this.userId(request));
  }

  @Get(':scriptId')
  getOne(@Req() request: AuthenticatedRequest, @Param('scriptId') scriptId: string) {
    return this.progressService.getOne(this.accessToken(request), this.userId(request), scriptId);
  }

  @Put(':scriptId')
  upsert(@Req() request: AuthenticatedRequest, @Param('scriptId') scriptId: string, @Body() body: unknown) {
    return this.progressService.upsert(this.accessToken(request), this.userId(request), scriptId, body);
  }

  private userId(request: AuthenticatedRequest): string {
    if (!request.user?.id) {
      throw new Error('Authenticated request is missing user');
    }
    return request.user.id;
  }

  private accessToken(request: AuthenticatedRequest): string {
    const authorization = request.headers['authorization'];
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    return header?.slice('Bearer '.length).trim() ?? '';
  }
}
