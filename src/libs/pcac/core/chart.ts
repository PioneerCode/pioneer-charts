import { axisBottom, axisLeft } from 'd3-axis';
import { selection, BaseType } from 'd3-selection';
import { PcacAxisBuilder } from './axis.builder';
import { PcacGridBuilder } from './grid.builder';
import { IPcacChartConfig } from './chart.model';
import { PcacColorService } from './color.service';
import { select } from 'd3-selection';
import { ElementRef, Injectable } from '@angular/core';

@Injectable()
export class PcacChart {
  margin = { top: 16, right: 16, bottom: 20, left: 40 };
  svg: d3.Selection<BaseType, {}, HTMLElement, any>;
  width = 400;
  height = 400;
  colors = [] as string[];

  constructor(
    public axisBuilder: PcacAxisBuilder,
    public gridBuilder: PcacGridBuilder,
    private colorService: PcacColorService
  ) {
  }

  setup(chartElm: ElementRef, config: IPcacChartConfig): void {
    select(chartElm.nativeElement).select('g').remove();
    this.width = chartElm.nativeElement.parentNode.clientWidth - this.margin.left - this.margin.right;
    this.height = config.height;
    this.colors = this.colorService.getColorScale(config.data.length);
  }

  buildContainer(chartElm: ElementRef, center = false): void {
    const combinedHeight = this.height + this.margin.top + this.margin.bottom;
    const combinedWidth = this.width + this.margin.left + this.margin.right;
    this.svg = select(chartElm.nativeElement)
      .attr('width', combinedWidth)
      .attr('height', combinedHeight);
    if (center) {
      this.svg = this.svg
        .append('g')
        .attr('transform', 'translate(' + combinedWidth / 2 + ',' + combinedHeight / 2 + ')');
      return;
    }
    this.svg = this.svg
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }
}
