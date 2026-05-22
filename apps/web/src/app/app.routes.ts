import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'learn',
    redirectTo: 'hy/learn/0',
    pathMatch: 'full',
  },
  {
    path: 'session',
    redirectTo: 'hy/session',
    pathMatch: 'full',
  },
  {
    path: ':scriptId',
    loadComponent: () => import('./pages/script-shell/script-shell').then((m) => m.ScriptShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'learn/0' },
      {
        path: 'learn',
        pathMatch: 'full',
        redirectTo: 'learn/0',
      },
      {
        path: 'learn/:stepIndex',
        loadComponent: () => import('./pages/learn/learn').then((m) => m.Learn),
      },
      {
        path: 'session',
        loadComponent: () => import('./pages/session/session').then((m) => m.Session),
      },
    ],
  },
];
