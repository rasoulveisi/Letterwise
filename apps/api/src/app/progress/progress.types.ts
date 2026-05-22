import type { AppProgressV2 } from '@letterwise/progress/domain';

export interface ProgressRow {
  readonly user_id: string;
  readonly script_id: string;
  readonly progress: unknown;
  readonly updated_at: string;
}

export interface ProgressResponse {
  readonly scriptId: string;
  readonly progress: AppProgressV2 | null;
  readonly updatedAt: string | null;
}

export interface ProgressListResponse {
  readonly items: readonly ProgressResponse[];
}
