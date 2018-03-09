import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { TableComponent } from './charts/table/table.component';
import { LineAreaChartComponent } from './charts/line-area-chart/line-area-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    BarChartComponent,
    TableComponent,
    LineAreaChartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
