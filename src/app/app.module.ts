import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { PioneerCodeAngularChartModule } from './pcac/pcac.module';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    PioneerCodeAngularChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
