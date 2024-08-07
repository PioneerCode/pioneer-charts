import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { IntroductionComponent } from './pages/docs/guides/introduction/introduction.component';
import { ThemeComponent } from './pages/docs/guides/theme/theme.component';
import { DataContractComponent } from './pages/docs/guides/data-contract/data-contract.component';
import { ChartsComponent } from './pages/charts/charts.component';
import { BarChartComponent } from './pages/docs/components/charts/bar-chart/bar-chart.component';
import { LineAreaChartComponent } from './pages/docs/components/charts/line-area-chart/line-area-chart.component';
import { PieChartComponent } from './pages/docs/components/charts/pie-chart/pie-chart.component';

export const routes: Routes = [
  { path: 'docs/guides/introduction', component: IntroductionComponent },
  { path: 'docs/guides/data-contract', component: DataContractComponent },
  { path: 'docs/guides/theme', component: ThemeComponent },
  { path: 'docs/components/charts/bar-chart', component: BarChartComponent },
  { path: 'docs/components/charts/line-area-chart', component: LineAreaChartComponent },
  { path: 'docs/components/charts/pie-chart', component: PieChartComponent},
  { path: 'charts', component: ChartsComponent },
  { path: '**', component: HomeComponent }
];
