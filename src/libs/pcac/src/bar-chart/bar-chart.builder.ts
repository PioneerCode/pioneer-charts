import { Injectable, ElementRef } from '@angular/core';
import { IPcacBarChartConfig } from './bar-chart.model';
import { select, selection, baseType } from 'd3-selection';
import { PcacColorService } from '../core';
import { PcacChart } from '../core/chart';

export interface IBarChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacBarChartConfig): void;
}

@Injectable()
export class BarChartBuilder extends PcacChart  {
  private numberOfTicks = 5;

  buildChart(chartElm: ElementRef, config: IPcacBarChartConfig): void {
    this.setup(chartElm, config);
    this.buildScales();
    this.drawChart(chartElm);
  }

  private buildScales() {
  }

  private drawChart(chartElm: ElementRef): void {
    this.prepSvg(chartElm);
    // this.drawAxis({
    //   svg: this.svg,
    //   numberOfTicks: this.numberOfTicks,
    //   height: this.height,
    //   xScale: this.xScale,
    //   yScale: this.yScale
    // });
  }
}
