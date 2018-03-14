import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PcacRepository } from './repository/pcac.repository';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    PioneerCodeAngularChartModule
  ],
  providers: [
    PcacRepository
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
