import { NgModule } from '@angular/core';
import { TableComponent } from './table.component';
import { PcacHeaderModule } from '../header/header.module';

@NgModule({
  imports: [
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
