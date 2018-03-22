import { NgModule } from '@angular/core';
import { PcacColorService } from './color.service';
import { PcacGridBuilder } from './grid.builder';
import { PcacAxisBuilder } from './axis.builder';

@NgModule({
  providers: [
    PcacColorService,
    PcacGridBuilder,
    PcacAxisBuilder
  ]
})
export class PcacCoreModule { }
