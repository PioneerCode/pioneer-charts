import { Injectable, ElementRef } from '@angular/core';
import { IPcacBarChartConfig } from './bar-chart.model';
import { select, selection, baseType } from 'd3-selection';
import { PcacColorService } from '../core';

export interface IBarChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacBarChartConfig): void;
}

@Injectable()
export class BarChartBuilder {
  private width = 400;
  private height = 400;
  private margin = { top: 16, right: 16, bottom: 20, left: 40 };
  private svg: selection<baseType, {}, HTMLElement, any>;
  private colors = [] as string[];

  constructor(private colorService: PcacColorService) { }

  buildChart(chartElm: ElementRef, config: IPcacBarChartConfig): void {
    this.setup(chartElm, config);
    this.buildScales();
    this.drawChart(chartElm);
  }

  private setup(chartElm: ElementRef, config: IPcacBarChartConfig): void {
    select(chartElm.nativeElement).select('g').remove();
    this.width = chartElm.nativeElement.parentNode.clientWidth - this.margin.left - this.margin.right;
    this.height = config.height;
    this.colors = this.colorService.getColorScale(config.data.length);
  }

  private buildScales() {

  }

  private drawChart(chartElm: ElementRef): void {
    this.svg = select(chartElm.nativeElement)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }
}
