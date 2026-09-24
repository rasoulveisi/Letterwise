import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'learn',
    redirectTo: 'hy/path',
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
      { path: '', pathMatch: 'full', redirectTo: 'path' },
      {
        path: 'path',
        loadComponent: () => import('./pages/curriculum-path/curriculum-path').then((m) => m.CurriculumPath),
      },
      {
        path: 'lesson/:lessonId',
        loadComponent: () => import('./pages/lesson-runner/lesson-runner').then((m) => m.LessonRunner),
      },
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
