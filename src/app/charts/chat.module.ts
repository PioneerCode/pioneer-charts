import { NgModule } from '@angular/core';
import { AppComponent } from '../app.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { TableComponent } from './table/table.component';
import { LineAreaChartComponent } from './line-area-chart/line-area-chart.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/header.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    AppComponent,
    BarChartComponent,
    TableComponent,
    LineAreaChartComponent
  ]
})
export class ChartModule { }
