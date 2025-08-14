import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'docs/guides/introduction', loadComponent: () => import('./docs/introduction/introduction.component').then(m => m.IntroductionComponent) },
    { path: 'docs/guides/theme', loadComponent: () => import('./docs/theme/theme.component').then(m => m.ThemeComponent) },
    { path: 'charts', loadComponent: () => import('./charts/charts.component').then(m => m.ChartsComponent) },
    { path: '**', loadComponent: () => import('./home/home').then(m => m.Home) }
];
