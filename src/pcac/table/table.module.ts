import { NgModule } from '@angular/core';
import { TableComponent } from './table.component';
import { BrowserModule } from '@angular/platform-browser';
import { PcacHeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    BrowserModule,
    PcacHeaderModule,
  ],
  exports: [
    PcacHeaderModule,
    TableComponent
  ],
  declarations: [
    TableComponent
  ]
})
export class PcacTableModule { }
