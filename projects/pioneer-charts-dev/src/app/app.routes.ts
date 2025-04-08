import { Routes } from '@angular/router';





export const routes: Routes = [
  { path: '', redirectTo: 'charts', pathMatch: 'full'},
  { path: 'charts', loadComponent: () => import('./charts/charts.component').then(m => m.ChartsComponent) },
  { path: 'test', loadComponent: () => import('./test/test.component').then(m => m.TestComponent) }
];
