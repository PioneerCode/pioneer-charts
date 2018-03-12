import { Injectable, ElementRef } from '@angular/core';
import { IBarChartConfig } from './bar-chart.model';
import { select, selection, baseType } from 'd3-selection';

export interface IBarChartBuilder {
  buildChart(chartElm: ElementRef, config: IBarChartConfig): void;
}

@Injectable()
export class BarChartBuilder {
  private width = 400;
  private height = 400;
  private margin = { top: 16, right: 16, bottom: 20, left: 40 };
  private svg: selection<baseType, {}, HTMLElement, any>;

  constructor() { }

  buildChart(chartElm: ElementRef, config: IBarChartConfig): void {
    this.setup(chartElm);
    this.buildScales(config);
    this.drawChart(chartElm);
  }

  private setup(chartElm: ElementRef): void {
    select(chartElm.nativeElement).select('g').remove();
    this.width = chartElm.nativeElement.parentNode.clientWidth - this.margin.left - this.margin.right;
    this.height = chartElm.nativeElement.parentNode.clientHeight - this.margin.top - this.margin.bottom;
  }

  private buildScales(config: IBarChartConfig) {

  }

  private drawChart(chartElm: ElementRef): void {
    this.svg = select(chartElm.nativeElement)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }
}
