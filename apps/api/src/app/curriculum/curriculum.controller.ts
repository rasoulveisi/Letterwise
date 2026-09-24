import { Controller, Get, Param } from '@nestjs/common';
import type { CurriculumResponse } from '@letterwise/progress/contracts';
import { CurriculumService } from './curriculum.service';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get(':scriptId')
  getCurriculum(@Param('scriptId') scriptId: string): Promise<CurriculumResponse> {
    return this.curriculumService.getCurriculum(scriptId);
  }
}
