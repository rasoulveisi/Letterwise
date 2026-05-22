import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_SCRIPTS } from '../../core/script-registry';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
})
export class Home {
  protected readonly scripts = ALL_SCRIPTS;
}
