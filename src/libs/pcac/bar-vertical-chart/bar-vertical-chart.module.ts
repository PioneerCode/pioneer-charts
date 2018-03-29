import { NgModule } from '@angular/core';
import { PcacBarVerticalChartComponent } from './bar-vertical-chart.component';
import { PcacCoreModule } from '../core';

@NgModule({
  exports: [
    PcacBarVerticalChartComponent
  ],
  declarations: [
    PcacBarVerticalChartComponent
  ],
  imports: [
    PcacCoreModule
  ]
})
export class PcacBarVerticalChartModule { }
