import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PcacRepository } from './repository/pcac.repository';
import { PcacLineAreaChartModule } from '../pcac/line-area-chart';
import { PcacHeaderModule } from '../pcac/header';
import { PcacTableModule } from '../pcac/table';
import { PcacBarChartModule } from '../pcac/bar-chart';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    PcacHeaderModule,
    PcacTableModule,
    PcacBarChartModule,
    PcacLineAreaChartModule
  ],
  providers: [
    PcacRepository
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
