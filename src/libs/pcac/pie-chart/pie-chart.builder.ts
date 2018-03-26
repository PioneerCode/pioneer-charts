import { Injectable, ElementRef } from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { select, selection, baseType } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line, area } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { PcacColorService } from '../core/color.service';
import { PcacChart } from '../core/chart';
import { IPcacData } from '../core/chart.model';
export interface IPieChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void;
}

@Injectable()
export class PieChartBuilder extends PcacChart implements IPieChartBuilder {
  private numberOfTicks = 5;
  private line: line<[number, number]>;
  private area: area<[number, number]>;
  private xScale: scaleLinear<number, number>;
  private yScale: scaleLinear<number, number>;

  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.setup(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private buildScales(config: IPcacPieChartConfig): void {

  }

  private drawChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.prepSvg(chartElm);
    this.axisBuilder.drawAxis({
      svg: this.svg,
      numberOfTicks: this.numberOfTicks,
      height: this.height,
      xScale: this.xScale,
      yScale: this.yScale
    });
    this.gridBuilder.drawHorizontalGrid({
      svg: this.svg,
      numberOfTicks: this.numberOfTicks,
      width: this.width,
      xScale: this.xScale,
      yScale: this.yScale
    });
  }

}
