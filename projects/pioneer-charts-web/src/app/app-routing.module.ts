import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartsComponent } from './pages/charts/charts.component';
import { BarChartComponent } from './pages/docs/components/charts/bar-chart/bar-chart.component';
import { LineAreaChartComponent } from './pages/docs/components/charts/line-area-chart/line-area-chart.component';
import { PieChartComponent } from './pages/docs/components/charts/pie-chart/pie-chart.component';
import { TableComponent } from './pages/docs/components/charts/table/table.component';
import { DialogComponent } from './pages/docs/components/helpers/dialog/dialog.component';
import { PaginationComponent } from './pages/docs/components/helpers/pagination/pagination.component';
import { SpinnerComponent } from './pages/docs/components/helpers/spinner/spinner.component';
import { HeaderComponent } from './pages/docs/components/ui/header/header.component';
import { DataContractComponent } from './pages/docs/guides/data-contract/data-contract.component';
import { IntroductionComponent } from './pages/docs/guides/introduction/introduction.component';
import { ThemeComponent } from './pages/docs/guides/theme/theme.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: 'docs/guides/introduction', component: IntroductionComponent },
  { path: 'docs/guides/data-contract', component: DataContractComponent },
  { path: 'docs/guides/theme', component: ThemeComponent },
  { path: 'docs/components/charts/bar-chart', component: BarChartComponent },
  { path: 'docs/components/charts/line-area-chart', component: LineAreaChartComponent },
  { path: 'docs/components/charts/table', component: TableComponent },
  { path: 'docs/components/charts/pie-chart', component: PieChartComponent},
  { path: 'docs/components/helpers/pagination', component: PaginationComponent},
  { path: 'docs/components/helpers/dialog', component: DialogComponent},
  { path: 'docs/components/helpers/spinner', component: SpinnerComponent},
  { path: 'docs/components/ui/header', component: HeaderComponent },
  { path: 'charts', component: ChartsComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
