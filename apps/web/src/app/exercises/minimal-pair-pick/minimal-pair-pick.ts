import { Component, input, output } from '@angular/core';
import { latinScaffoldForHint } from '../../core/hint-policy';
import type { HintLevel } from '../../core/models';

@Component({
  selector: 'app-minimal-pair-pick',
  imports: [],
  templateUrl: './minimal-pair-pick.html',
})
export class MinimalPairPick {
  readonly glyphs = input.required<readonly [string, string]>();
  readonly targetLetter = input.required<string>();
  readonly latinFull = input.required<string>();
  readonly hintLevel = input.required<HintLevel>();

  readonly chosen = output<string>();

  protected scaffold(): string {
    return latinScaffoldForHint(this.targetLetter(), this.hintLevel(), this.latinFull());
  }

  protected pick(letter: string): void {
    this.chosen.emit(letter);
  }
}
