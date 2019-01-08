/**
 * Angular
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

/**
 * App
 */
import { AppComponent } from './app.component';
import { PcRepository } from './repository/pc.repository';
import { PcService } from './services/pc.service';
import { ChartsComponent } from './pages/charts/charts.component';
import { TestComponent } from './pages/test/test.component';

/**
 * Modules
 */
import { PcacCoreModule } from '../../../../projects/pcac/src/lib/core';
import { PcacHeaderModule } from '../../../../projects/pcac/src/lib/header';
import { PcacTableModule } from '../../../../projects/pcac/src/lib/table';
import { PcacPieChartModule } from '../../../../projects/pcac/src/lib/pie-chart';
import { PcacBarVerticalChartModule } from '../../../../projects/pcac/src/lib/bar-chart/bar-vertical-chart';
import { PcacBarHorizontalChartModule } from '../../../../projects/pcac/src/lib/bar-chart/bar-horizontal-chart';
import { PcacLineAreaChartModule } from '../../../../projects/pcac/src/lib/line-area-chart';
import { PcacPaginationModule } from '../../../../projects/pcac/src/lib/pagination/pagination.module';
import { PcacDialogModule } from '../../../../projects/pcac/src/lib/dialog';
import { PcacSpinnerModule } from '../../../../projects/pcac/src/lib/spinner/spinner.module';

/**
 * Pioneer Charts
 */

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
    PcacLineAreaChartModule,
    PcacPaginationModule,
    PcacDialogModule,
    PcacSpinnerModule
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
