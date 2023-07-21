import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {  HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ChartsComponent } from './charts/charts.component';

import { PcacBarHorizontalChartModule, PcacBarVerticalChartModule, PcacLineAreaChartModule, PcacPieChartModule } from "pioneer-charts"
import { TestComponent } from '../test/test.component';


@NgModule({
  declarations: [
    AppComponent,
    ChartsComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    PcacLineAreaChartModule,
    PcacBarHorizontalChartModule,
    PcacBarVerticalChartModule,
    PcacPieChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
