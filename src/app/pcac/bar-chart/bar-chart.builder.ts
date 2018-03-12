import { Injectable, ElementRef } from '@angular/core';
import { IBarChartConfig } from './bar-chart.model';

export interface IBarChartBuilder {
  buildChart(chartElm: ElementRef, config: IBarChartConfig): void;
}

@Injectable()
export class BarChartBuilder {

  constructor() { }

  buildChart(chartElm: ElementRef, config: IBarChartConfig): void {

  }
}
