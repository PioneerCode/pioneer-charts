import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PcacRepository } from './repository/pcac.repository';
import {
  PcacCoreModule,
  PcacHeaderModule,
  PcacTableModule,
  PcacBarChartModule,
  PcacLineAreaChartModule,
  PcacBarHorizontalChartModule
} from '@pioneer-code/pioneer-code-angular-charts';
import { HomeComponent } from './pages/home/home.component';
import { LineAreaChartComponent } from './pages/line-area-chart/line-area-chart.component';
import { BarChartComponent } from './pages/bar-chart/bar-chart.component';
import { HeaderComponent } from './pages/header/header.component';
import { TableComponent } from './pages/table/table.component';
import { RouterModule, Routes } from '@angular/router';
import { PcacService } from './services/pcac.service';
import { GetStartedComponent } from './pages/get-started/get-started.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PrismComponent } from './components/prism/prism.component';
import { ChartNavComponent } from './components/chart-nav/chart-nav.component';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';

const appRoutes: Routes = [
  { path: 'get-started', component: GetStartedComponent },
  { path: 'bar-chart', component: BarChartComponent },
  { path: 'line-area-chart', component: LineAreaChartComponent },
  { path: 'table', component: TableComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'home', component: HomeComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LineAreaChartComponent,
    BarChartComponent,
    HeaderComponent,
    TableComponent,
    GetStartedComponent,
    PageHeaderComponent,
    PrismComponent,
    ChartNavComponent,
    NavComponent,
    FooterComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    HttpClientModule,
    PcacCoreModule,
    PcacHeaderModule,
    PcacTableModule,
    PcacBarChartModule,
    PcacLineAreaChartModule,
    PcacBarHorizontalChartModule
  ],
  providers: [
    PcacRepository,
    PcacService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
