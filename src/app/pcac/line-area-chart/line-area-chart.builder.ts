import { Injectable, ElementRef } from '@angular/core';
import { ILineAreaChartConfig } from './line-area-chart.model';

export interface ILineAreaChartBuilder {
  buildChart(chartElm: ElementRef, config: ILineAreaChartConfig): void;
}

@Injectable()
export class LineAreaChartBuilder implements ILineAreaChartBuilder {

  constructor() { }

  buildChart(chartElm: ElementRef, config: ILineAreaChartConfig): void {
  }
}
