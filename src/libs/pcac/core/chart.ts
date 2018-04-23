import { axisBottom, axisLeft } from 'd3-axis';
import { selection, BaseType } from 'd3-selection';
import { PcacAxisBuilder } from './axis.builder';
import { PcacGridBuilder } from './grid.builder';
import { IPcacChartConfig } from './chart.model';
import { PcacColorService } from './color.service';
import { select } from 'd3-selection';
import { ElementRef, Injectable } from '@angular/core';
import { IPcacData } from '.';
import { PcacTransitionService } from './transition.service';

@Injectable()
export class PcacChart {
  margin = { top: 16, right: 16, bottom: 20, left: 40 };
  svg: d3.Selection<BaseType, {}, HTMLElement, any>;
  width = 400;
  height = 400;
  colors = [] as string[];
  startData = [] as any[]; // TODO: Strongly type
  endData = [] as any[]; // TODO: Strongly type

  constructor(
    public axisBuilder: PcacAxisBuilder,
    public gridBuilder: PcacGridBuilder,
    private colorService: PcacColorService,
    public transitionService: PcacTransitionService
  ) { }

  /**
   * Prior to building a chart, we need to initialize the state of the chart
   * @param chartElm Reference to SVG on dom
   * @param config Chart specific configuration
   */
  initializeChartState(chartElm: ElementRef, config: IPcacChartConfig): void {
    select(chartElm.nativeElement).select('g').remove();
    this.width = chartElm.nativeElement.parentNode.clientWidth - this.margin.left - this.margin.right;
    this.height = config.height;
    this.colors = this.colorService.getColorScale(config.data.length);
  }

  /**
   * 1) Set the width and height of the SVG
   * 2) Add a group and translate it to state of {{center}} option
   * @param chartElm Reference to SVG on dom
   * @param center Are we pinning x,y to the top,left, or are we centering our drawing group inside the SVG.
   */
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

  /**
   * Most charts share a default margin(s) state.
   * In some cases, that state needs to be calculated based on the content that resides in that margin.
   * For example, labels on a horizontal bar chart are dynamic and such the margin needs to be calculated ahead of
   * chart axis construction.
   * @param chartElm Reference to SVG on dom
   * @param data Generic multi-dimensional IPcacData structure
   * @param yScale D3 scale transformation object (d3.ScaleBand)
   */
  setHorizontalMarginsBasedOnContent(chartElm: ElementRef, data: IPcacData[], yScale: any): void {
    const axisY = axisLeft(yScale).ticks(5);
    let max = 0;
    select(chartElm.nativeElement).append('g')
      .call(axisY)
      .each((d, i, n: any) => {
        if (n[i].getBBox().width > max) {
          max = n[i].getBBox().width;
        }
      })
      .remove();
    this.margin.left = max;
    this.margin.bottom = this.margin.bottom;
  }
}
