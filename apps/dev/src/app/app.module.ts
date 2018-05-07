/**
 * Angular
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { PcRepository } from './repository/pc.repository';
import { PcService } from './services/pc.service';
import { ChartsComponent } from './pages/charts/charts.component';
import { TestComponent } from './pages/test/test.component';

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
  { path: '', redirectTo: 'charts', pathMatch: 'full'},
  { path: 'charts', component: ChartsComponent },
  { path: 'test', component: TestComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ChartsComponent,
    TestComponent
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
    PcRepository,
    PcService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
