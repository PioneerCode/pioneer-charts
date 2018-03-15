import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PcacRepository } from './repository/pcac.repository';
import {
  PcacHeaderModule,
  PcacTableModule,
  PcacBarChartModule,
  PcacLineAreaChartModule
} from '@pioneer-code/pioneer-code-angular-charts';

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
