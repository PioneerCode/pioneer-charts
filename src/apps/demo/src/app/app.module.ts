import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PcacRepository } from './repository/pcac.repository';
import {
  PcacHeaderModule,
  PcacTableModule,
  PcacBarChartModule,
  PcacLineAreaChartModule
} from '@pioneer-code/pioneer-code-angular-charts';
import { HomeComponent } from './pages/home/home.component';
import { LineAreaChartComponent } from './pages/line-area-chart/line-area-chart.component';
import { BarChartComponent } from './pages/bar-chart/bar-chart.component';
import { HeaderComponent } from './pages/header/header.component';
import { TableComponent } from './pages/table/table.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  { path: '**', component: HomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LineAreaChartComponent,
    BarChartComponent,
    HeaderComponent,
    TableComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes
    ),
    BrowserModule,
    HttpClientModule,
    PcacHeaderModule,
    PcacTableModule,
    PcacBarChartModule,
    PcacLineAreaChartModule
  ],
  providers: [
    PcacRepository
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
