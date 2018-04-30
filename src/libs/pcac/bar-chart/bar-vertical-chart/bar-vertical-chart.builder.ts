import { Injectable, ElementRef } from '@angular/core';

import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { PcacChart } from '../../core/chart';
import { IPcacData } from '../../core/chart.model';

import { select, selection, } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { color } from 'd3-color';
import { transition } from 'd3-transition';

export interface IBarVerticalChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void;
}

@Injectable()
export class BarVerticalChartBuilder extends PcacChart {
  private xScaleStacked: d3.ScaleBand<string>;
  private xScaleGrouped: d3.ScaleBand<string>;
  private yScale: d3.ScaleLinear<number, number>;

  buildChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void {
    this.initializeChartState(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private buildScales(config: IPcacBarVerticalChartConfig) {
    this.yScale = scaleLinear()
      .rangeRound([0, config.height])
      .domain([config.domainMax, 0]);

    this.xScaleStacked = scaleBand()
      .domain(config.data.map((d) => d.key as string))
      .rangeRound([0, this.width])
      .padding(0.1);

    this.xScaleGrouped = scaleBand()
      .padding(0.05)
      .rangeRound([0, this.xScaleStacked.bandwidth()])
      .domain(config.data[0].data.map((d) => d.key as string));
  }

  private drawChart(chartElm: ElementRef, config: IPcacBarVerticalChartConfig): void {
    this.buildContainer(chartElm);
    this.axisBuilder.drawAxis({
      svg: this.svg,
      numberOfTicks: config.numberOfTicks || 5,
      height: this.height,
      xScale: this.xScaleStacked,
      yScale: this.yScale
    });
    this.gridBuilder.drawHorizontalGrid({
      svg: this.svg,
      numberOfTicks: config.numberOfTicks || 5,
      width: this.width,
      xScale: this.xScaleStacked,
      yScale: this.yScale
    });
    this.addBars(config);
  }

  private addBars(config: IPcacBarVerticalChartConfig) {
    const self = this;
    this.svg.append('g')
      .attr('class', 'pc-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pc-bar-group')
      .attr('transform', (d: IPcacData, i: number) => {
        return 'translate(' + this.xScaleStacked(d.key as string) + ',0)';
      })
      .selectAll('rect')
      .data((d: IPcacData) => {
        return d.data;
      })
      .enter().append('rect')
      .attr('class', 'pc-bar')
      .attr('x', (d: IPcacData) => {
        return config.isGroup ? this.xScaleGrouped(d.key as string) : this.xScaleStacked(d.key as string);
      })
      .style('fill', (d: IPcacData, i: number, n: any) => {
        return this.colors[i];
      })
      .attr('width', config.isGroup ? this.xScaleGrouped.bandwidth() : this.xScaleStacked.bandwidth())
      .attr('y', () => {
        return this.height;
      })
      .attr('height', 0)
      .on('mouseover', function (d: IPcacData, i: number) {
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
          .style('fill', color(self.colors[i]).darker(1).toString());
      })
      .on('mousemove', function (d: IPcacData, i: number) {
        self.tooltipBuilder.showBarTooltip(d);
      })
      .on('mouseout', function (d: IPcacData, i: number) {
        self.tooltipBuilder.hideTooltip();
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
          .style('fill', self.colors[i]);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: IPcacData) => {
        return this.yScale(d.value as number);
      })
      .attr('height', (d: IPcacData, ) => {
        return this.height - this.yScale(d.value as number);
      });
  }
}
