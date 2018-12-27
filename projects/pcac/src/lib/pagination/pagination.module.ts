import { NgModule } from '@angular/core';
import { PaginationComponent } from './pagination.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    PaginationComponent
  ],
  declarations: [
    PaginationComponent
  ]
})
export class PcacPaginationModule { }
