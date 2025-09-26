import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'docs/guides/introduction', loadComponent: () => import('./docs/introduction/introduction.component').then(m => m.IntroductionComponent) },
    { path: 'docs/guides/theme', loadComponent: () => import('./docs/theme/theme.component').then(m => m.ThemeComponent) },
    { path: 'docs/guides/data-contract', loadComponent: () => import('./docs/data-contract/data-contract.component').then(m => m.DataContractComponent) },
    { path: 'docs/components/charts/legend', loadComponent: () => import('./docs/legend/legend.component').then(m => m.LegendComponent) },
    { path: 'docs/components/charts/bar-chart', loadComponent: () => import('./docs/bar-chart/bar-chart.component').then(m => m.BarChartComponent) },
    { path: 'docs/components/charts/area-chart', loadComponent: () => import('./docs/plot-line-area/area/area-chart.component').then(m => m.AreaChartComponent) },
    { path: 'docs/components/charts/line-chart', loadComponent: () => import('./docs/plot-line-area/line/line-chart.component').then(m => m.LineChartComponent) },
    { path: 'docs/components/charts/plot-chart', loadComponent: () => import('./docs/plot-line-area/plot/plot-chart.component').then(m => m.PlotChartComponent) },
    { path: 'docs/components/charts/pie-chart', loadComponent: () => import('./docs/pie-chart/pie-chart.component').then(m => m.PieChartComponent) },
    { path: 'charts', loadComponent: () => import('./charts/charts.component').then(m => m.ChartsComponent) },
    { path: '**', loadComponent: () => import('./home/home').then(m => m.Home) }
];
