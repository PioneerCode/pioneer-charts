import { NgModule } from '@angular/core';
import { PcacBarChartModule } from './bar-chart/bar-chat.module';
import { PcacLineAreaChartModule } from './line-area-chart/line-area-chart.module';
import { PcacTableModule } from './table/table.module';

@NgModule({
  imports: [
    PcacBarChartModule,
    PcacLineAreaChartModule,
    PcacTableModule
  ],
  exports: [
    PcacBarChartModule,
    PcacLineAreaChartModule,
    PcacTableModule
  ]
})
export class PioneerCodeAngularChartModule { }
