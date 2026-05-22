import { Component, input, output } from '@angular/core';
import { latinScaffoldForHint } from '../../core/hint-policy';
import type { HintLevel } from '../../core/models';

@Component({
  selector: 'app-letter-pick',
  imports: [],
  templateUrl: './letter-pick.html',
})
export class LetterPick {
  readonly targetLetter = input.required<string>();
  readonly latinFull = input.required<string>();
  readonly hintLevel = input.required<HintLevel>();
  readonly options = input.required<readonly string[]>();

  readonly chosen = output<string>();

  protected scaffold(): string {
    return latinScaffoldForHint(this.targetLetter(), this.hintLevel(), this.latinFull());
  }

  protected pick(letter: string): void {
    this.chosen.emit(letter);
  }
}
