import { NgModule } from '@angular/core';
import { PcacBarChartHorizontalComponent } from './bar-horizontal-chart.component';
import { PcacCoreModule } from '../core';

@NgModule({
  exports: [
    PcacBarChartHorizontalComponent
  ],
  declarations: [
    PcacBarChartHorizontalComponent
  ],
  imports: [
    PcacCoreModule
  ]
})
export class PcacBarHorizontalChartModule { }
