import { Injectable, ElementRef } from '@angular/core';
import { IPcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { select, selection, baseType } from 'd3-selection';
import { PcacChart } from '../core/chart';
import { scaleBand, scaleLinear } from 'd3-scale';
import { IPcacData } from '../core/chart.model';

@Injectable()
export class BarHorizontalChartBuilder extends PcacChart {
  private numberOfTicks = 5;
  private xScale: scaleBand<string>;
  private yScale: scaleLinear<number, number>;

  buildChart(chartElm: ElementRef, config: IPcacBarHorizontalChartConfig): void {
    this.setup(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private buildScales(config: IPcacBarHorizontalChartConfig) {
    const barMap = config.data[0].data.map((d) => {
      return d.value;
    });

    this.xScale = scaleLinear()
      .domain([0, config.domainMax])
      .range([0, this.width]);

    this.yScale = scaleBand()
      .domain(config.data.map((d) => d.key))
      .range([this.height, 0])
      .padding(0.1);
  }

  private drawChart(chartElm: ElementRef, config: IPcacBarHorizontalChartConfig): void {
    this.prepSvg(chartElm);
    this.axisBuilder.drawAxis({
      svg: this.svg,
      numberOfTicks: this.numberOfTicks,
      height: this.height,
      xScale: this.xScale,
      yScale: this.yScale
    });
    this.gridBuilder.drawVerticalGrid({
      svg: this.svg,
      numberOfTicks: this.numberOfTicks,
      height: this.height,
      xScale: this.xScale,
      yScale: this.yScale
    });
    this.addBars(config);
  }

  private addBars(config: IPcacBarHorizontalChartConfig) {
    this.svg.append('g')
      .attr('class', 'bar-groups')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'bars')
      .attr('transform', (d) => 'translate(0,' + this.yScale(d.key) + ')')
      .selectAll('rect')
      .data((d: IPcacData) => {
        return d.data;
      })
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d: IPcacData) => {
        return this.yScale(d.key);
      })
      .attr('height', this.yScale.bandwidth())
      .style('fill', (d: IPcacData, i: number) => {
        return this.colors[i];
      })
      .attr('width', (d: IPcacData) => {
        return this.xScale(d.value);
      });
  }
}
