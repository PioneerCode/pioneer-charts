import { NgModule } from '@angular/core';
import { PcacColorService } from './color.service';
import { PcacGridBuilder } from './grid.builder';
import { PcacAxisBuilder } from './axis.builder';
import { PcacTransitionService } from './transition.service';

@NgModule({
  providers: [
    PcacColorService,
    PcacTransitionService,
    PcacGridBuilder,
    PcacAxisBuilder
  ]
})
export class PcacCoreModule { }
