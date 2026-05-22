import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { getScriptDefinition } from '../core/script-registry';

@Injectable()
export class ScriptContextService {
  private readonly route = inject(ActivatedRoute);

  readonly scriptId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('scriptId') ?? undefined)),
    { initialValue: this.route.snapshot.paramMap.get('scriptId') ?? undefined },
  );

  readonly definition = computed(() => {
    const id = this.scriptId();
    return id ? getScriptDefinition(id) : undefined;
  });
}
