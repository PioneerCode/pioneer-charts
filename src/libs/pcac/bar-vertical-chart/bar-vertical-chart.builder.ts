import { Injectable, ElementRef } from '@angular/core';
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { select, selection, } from 'd3-selection';
import { PcacChart } from '../core/chart';
import { scaleBand, scaleLinear } from 'd3-scale';
import { IPcacData } from '../core/chart.model';

export interface IBarVerticalChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void;
}

@Injectable()
export class BarVerticalChartBuilder extends PcacChart {
  private numberOfTicks = 5;
  private xScale: d3.ScaleBand<string>;
  private yScale: d3.ScaleLinear<number, number>;

  buildChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void {
    this.setup(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private buildScales(config: IPcacBarVerticalChartConfig) {
    this.yScale = scaleLinear()
      .domain([config.domainMax, 0])
      .range([0, config.height]);

    this.xScale = scaleBand()
      .domain(config.data.map((d) => d.key as string))
      .range([0, this.width])
      .padding(0.1);
  }

  private drawChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void {
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
    this.addBars(config);
  }

  private addBars(config: IPcacBarVerticalChartConfig) {
    this.svg.append('g')
      .attr('class', 'pc-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pc-bar-group')
      .attr('transform', (d: IPcacData, i: number) => {
        return 'translate(' + this.xScale(d.key as string) + ',0)';
      })
      .selectAll('rect')
      .data((d: IPcacData) => {
        return d.data;
      })
      .enter().append('rect')
      .attr('class', 'pc-bar')
      .attr('x', (d: IPcacData) => {
        return this.xScale(d.key as string);
      })
      .style('fill', (d: IPcacData, i: number, n: any) => {
        return this.colors[i];
      })
      .attr('width', this.xScale.bandwidth())
      .attr('y', (d: IPcacData) => {
        return this.yScale(d.value as number);
      })
      .attr('height', (d: IPcacData, ) => {
        return this.height - this.yScale(d.value as number);
      });
  }
}
