import { NgModule } from '@angular/core';
import { PcacComponent } from './pcac.component';
import { PaginationComponent } from './pagination/pagination.component';

@NgModule({
  imports: [
  ],
  declarations: [PcacComponent, PaginationComponent],
  exports: [PcacComponent]
})
export class PcacModule { }
