import { Injectable, ElementRef } from '@angular/core';
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { select, selection, baseType } from 'd3-selection';
import { PcacColorService } from '../core';
import { PcacChart } from '../core/chart';
import { scaleBand, ScaleLinear } from 'd3-scale';

export interface IBarVerticalChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void;
}

@Injectable()
export class BarVerticalChartBuilder extends PcacChart {
  private numberOfTicks = 5;
  private xGroups: scaleBand<string>;
  private xSingleGroup: scaleBand<string>;
  private xBars: scaleBand<string>;
  private y: ScaleLinear<number, number>;

  buildChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void {
    this.setup(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm);
  }

  private buildScales(config: IPcacBarVerticalChartConfig) {
    // const groupMap = config.data.map((d) => {
    //   return d.label;
    // });

    // const barMap = config.data[0].data.map((d) => {
    //   return d.key;
    // });

    // this.y = ScaleLinear()
    //   .domain([config.domainMax, 0])
    //   .range([0, config.height]);

    // this.xGroups = scaleBand()
    //   .domain(groupMap)
    //   .range([0, this.width])
    //   .padding(0.1);

    // this.xSingleGroup = scaleBand()
    //   .domain(barMap)
    //   .rangeRound([0, this.xGroups.bandwidth()])
    //   .padding(0.1);

    // this.xBars = scaleBand()
    //   .domain(barMap)
    //   .rangeRound([0, this.xGroups.bandwidth()])
    //   .padding(0.1);
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
