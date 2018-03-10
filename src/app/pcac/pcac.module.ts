import { NgModule } from '@angular/core';
import { AppComponent } from '../app.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { TableComponent } from './table/table.component';
import { LineAreaChartComponent } from './line-area-chart/line-area-chart.component';
import { BrowserModule } from '@angular/platform-browser';
import { HeaderComponent } from './header/header.component';

// TODO: Why do we need to add AppComponent to this module?
@NgModule({
  imports: [BrowserModule],
  declarations: [
    AppComponent,
    BarChartComponent,
    TableComponent,
    LineAreaChartComponent,
    HeaderComponent
  ]
})
export class PioneerCodeAngularChartModule { }
