import { NgModule } from '@angular/core';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { TableComponent } from './table/table.component';
import { LineAreaChartComponent } from './line-area-chart/line-area-chart.component';
import { PcacBarChartModule } from './bar-chart/bart-chat.module';
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
