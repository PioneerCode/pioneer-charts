import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'charts', loadComponent: () => import('./charts/charts.component').then(m => m.ChartsComponent) },
    { path: '**', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) }
];
