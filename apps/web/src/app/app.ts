import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  },
})
export class App {}
