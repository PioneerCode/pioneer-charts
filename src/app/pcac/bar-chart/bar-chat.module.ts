import { NgModule } from '@angular/core';
import { BarChartComponent } from './bar-chart.component';
import { PcacHeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    PcacHeaderModule
  ],
  exports: [
    PcacHeaderModule,
    BarChartComponent
  ],
  declarations: [
    BarChartComponent
  ]
})
export class PcacBarChartModule { }
