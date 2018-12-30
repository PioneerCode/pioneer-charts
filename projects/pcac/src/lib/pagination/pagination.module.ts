import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PaginationComponent } from './pagination.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PaginationComponent
  ],
  declarations: [
    PaginationComponent
  ]
})
export class PcacPaginationModule { }
