import { NgModule } from '@angular/core';
import { PcacColorService } from './color.service';
import { PcacGridBuilder } from './grid.builder';
import { PcacAxisBuilder } from './axis.builder';
import { PcacTransitionService } from './transition.service';
import { PcacTooltipBuilder } from './tooltip.builder';

@NgModule({
  providers: [
    PcacColorService,
    PcacTransitionService,
    PcacGridBuilder,
    PcacAxisBuilder,
    PcacTooltipBuilder
  ]
})
export class PcacCoreModule { }
