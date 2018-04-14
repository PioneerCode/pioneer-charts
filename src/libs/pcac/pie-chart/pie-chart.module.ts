import { NgModule } from '@angular/core';
import { PcacPieChartComponent } from './pie-chart.component';
import { PcacCoreModule } from '../core';

@NgModule({
  exports: [
    PcacPieChartComponent
  ],
  declarations: [
    PcacPieChartComponent
  ]
})
export class PcacPieChartModule { }
