/**
 * Angular
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

/**
 * Demo deps
 */
import { PcacRepository } from './repository/pc.repository';
import { PcService } from './services/pc.service';

/**
 * Demo Pages
 */
import { HomeComponent } from './pages/home/home.component';
import { LineAreaChartComponent } from './pages/line-area-chart/line-area-chart.component';
import { BarChartComponent } from './pages/bar-chart/bar-chart.component';
import { HeaderComponent } from './pages/header/header.component';
import { TableComponent } from './pages/table/table.component';
import { GetStartedComponent } from './pages/get-started/get-started.component';
import { DemoComponent } from './pages/demo/demo.component';
import { PieChartComponent } from './pages/pie-chart/pie-chart.component';

/**
 * Demo Components
 */
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PrismComponent } from './components/prism/prism.component';
import { ChartNavComponent } from './components/chart-nav/chart-nav.component';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * Pioneer Charts
 */
import {
  PcacCoreModule,
  PcacHeaderModule,
  PcacPieChartModule,
  PcacTableModule,
  PcacBarVerticalChartModule,
  PcacBarHorizontalChartModule,
  PcacLineAreaChartModule
} from '@pioneer-code/pioneer-charts';


const appRoutes: Routes = [
  { path: 'guides/get-started', component: GetStartedComponent },
  { path: 'components/charts/bar-chart', component: BarChartComponent },
  { path: 'components/charts/line-area-chart', component: LineAreaChartComponent },
  { path: 'components/charts/table', component: TableComponent },
  { path: 'components/charts/pie-chart', component: PieChartComponent},
  { path: 'components/ui/header', component: HeaderComponent },
  { path: 'demo', component: DemoComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LineAreaChartComponent,
    BarChartComponent,
    HeaderComponent,
    PieChartComponent,
    TableComponent,
    GetStartedComponent,
    PageHeaderComponent,
    PrismComponent,
    ChartNavComponent,
    NavComponent,
    FooterComponent,
    DemoComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    HttpClientModule,
    PcacCoreModule,
    PcacHeaderModule,
    PcacTableModule,
    PcacPieChartModule,
    PcacBarVerticalChartModule,
    PcacBarHorizontalChartModule,
    PcacLineAreaChartModule
  ],
  providers: [
    PcacRepository,
    PcService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
