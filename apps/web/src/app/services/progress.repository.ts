import { Injectable } from '@angular/core';
import type { AppProgress, AppProgressV2 } from '@letterwise/progress/domain';
import { KNOWN_SCRIPT_IDS } from '@letterwise/scripts/domain';
import { loadProgress, migrateProgressForSync, progressStorageKey, saveProgress } from '../core/progress-storage';

@Injectable({ providedIn: 'root' })
export class ProgressRepository {
  load(scriptId: string): AppProgress {
    return loadProgress(progressStorageKey(scriptId));
  }

  save(scriptId: string, progress: AppProgress): void {
    saveProgress(progressStorageKey(scriptId), progress);
  }

  loadForSync(scriptId: string, updatedAtMs?: number): AppProgressV2 {
    const progress = migrateProgressForSync(this.load(scriptId), updatedAtMs);
    this.save(scriptId, progress);
    return progress;
  }

  saveCanonical(scriptId: string, progress: AppProgressV2): void {
    this.save(scriptId, progress);
  }

  knownLocalScriptIds(): readonly string[] {
    return KNOWN_SCRIPT_IDS.filter((scriptId) => globalThis.localStorage?.getItem(progressStorageKey(scriptId)));
  }
}
