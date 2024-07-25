import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { IntroductionComponent } from './pages/docs/guides/introduction/introduction.component';
import { ThemeComponent } from './pages/docs/guides/theme/theme.component';
import { DataContractComponent } from './pages/docs/guides/data-contract/data-contract.component';

export const routes: Routes = [
  { path: 'docs/guides/introduction', component: IntroductionComponent },
  { path: 'docs/guides/data-contract', component: DataContractComponent },
  { path: 'docs/guides/theme', component: ThemeComponent },
  // { path: 'docs/components/charts/bar-chart', component: BarChartComponent },
  // { path: 'docs/components/charts/line-area-chart', component: LineAreaChartComponent },
  // { path: 'docs/components/charts/table', component: TableComponent },
  // { path: 'docs/components/charts/pie-chart', component: PieChartComponent},
  // { path: 'docs/components/helpers/pagination', component: PaginationComponent},
  // { path: 'docs/components/helpers/dialog', component: DialogComponent},
  // { path: 'docs/components/helpers/spinner', component: SpinnerComponent},
  // { path: 'docs/components/ui/header', component: HeaderComponent },
  // { path: 'charts', component: ChartsComponent },
  { path: '**', component: HomeComponent }
];
