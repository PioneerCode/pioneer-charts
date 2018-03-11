import { NgModule } from '@angular/core';
import { TableComponent } from './table.component';
import { BrowserModule } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  exports: [
    TableComponent,
    HeaderComponent
  ],
  declarations: [
    TableComponent,
    HeaderComponent
  ]
})
export class PcacTableModule { }
