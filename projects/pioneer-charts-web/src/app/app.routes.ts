import { Routes } from '@angular/router';










export const routes: Routes = [
  { path: 'docs/guides/introduction', loadComponent: () => import('./pages/docs/guides/introduction/introduction.component').then(m => m.IntroductionComponent) },
  { path: 'docs/guides/data-contract', loadComponent: () => import('./pages/docs/guides/data-contract/data-contract.component').then(m => m.DataContractComponent) },
  { path: 'docs/guides/theme', loadComponent: () => import('./pages/docs/guides/theme/theme.component').then(m => m.ThemeComponent) },
  { path: 'docs/components/charts/bar-chart', loadComponent: () => import('./pages/docs/components/charts/bar-chart/bar-chart.component').then(m => m.BarChartComponent) },
  { path: 'docs/components/charts/line-area-chart', loadComponent: () => import('./pages/docs/components/charts/line-area-chart/line-area-chart.component').then(m => m.LineAreaChartComponent) },
  { path: 'docs/components/charts/pie-chart', loadComponent: () => import('./pages/docs/components/charts/pie-chart/pie-chart.component').then(m => m.PieChartComponent)},
  { path: 'charts', loadComponent: () => import('./pages/charts/charts.component').then(m => m.ChartsComponent) },
  { path: '**', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) }
];
