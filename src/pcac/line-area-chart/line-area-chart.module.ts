import { NgModule } from '@angular/core';
import { LineAreaChartComponent } from './line-area-chart.component';
import { PcacHeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    PcacHeaderModule
  ],
  exports: [
    PcacHeaderModule,
    LineAreaChartComponent
  ],
  declarations: [
    LineAreaChartComponent
  ]
})
export class PcacLineAreaChartModule { }
