import { NgModule } from '@angular/core';

import { PcacPieChartComponent } from './pie-chart.component';
import { CommonModule } from '@angular/common';

@NgModule({
  exports: [
    PcacPieChartComponent
  ],
  imports: [
    CommonModule,
  ],
  declarations: [
    PcacPieChartComponent
  ]
})
export class PcacPieChartModule { }
