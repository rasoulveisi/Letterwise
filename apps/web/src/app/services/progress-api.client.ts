import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AppProgressV2 } from '@letterwise/progress/domain';
import type {
  CurriculumResponse,
  LessonCompleteRequest,
  LessonCompleteResponse,
  ProgressListResponse,
  ProgressResponse,
} from '@letterwise/progress/contracts';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  if (!token || !request.url.startsWith(environment.apiBaseUrl)) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

@Injectable({ providedIn: 'root' })
export class ProgressApiClient {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = environment.apiBaseUrl;

  getProgress(scriptId: string): Promise<ProgressResponse> {
    return this.withAuthRetry(() => firstValueFrom(this.http.get<ProgressResponse>(`${this.baseUrl}/progress/${scriptId}`)));
  }

  getAllProgress(): Promise<ProgressListResponse> {
    return this.withAuthRetry(() => firstValueFrom(this.http.get<ProgressListResponse>(`${this.baseUrl}/progress`)));
  }

  putProgress(scriptId: string, progress: AppProgressV2): Promise<ProgressResponse> {
    return this.withAuthRetry(() =>
      firstValueFrom(this.http.put<ProgressResponse>(`${this.baseUrl}/progress/${scriptId}`, { progress })),
    );
  }

  getCurriculum(scriptId: string): Promise<CurriculumResponse> {
    return firstValueFrom(this.http.get<CurriculumResponse>(`${this.baseUrl}/curriculum/${scriptId}`));
  }

  completeLesson(scriptId: string, payload: LessonCompleteRequest): Promise<LessonCompleteResponse> {
    return this.withAuthRetry(() =>
      firstValueFrom(this.http.put<LessonCompleteResponse>(`${this.baseUrl}/progress/${scriptId}/lesson-complete`, payload)),
    );
  }

  private async withAuthRetry<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !(await this.auth.refreshSession())) {
        throw error;
      }
      try {
        return await request();
      } catch (retryError) {
        if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
          await this.auth.signOut();
        }
        throw retryError;
      }
    }
  }
}
