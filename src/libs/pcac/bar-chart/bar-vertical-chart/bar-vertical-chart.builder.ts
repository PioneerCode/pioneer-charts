import { Injectable, ElementRef } from '@angular/core';

import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { PcacChart } from '../../core/chart';
import { IPcacData } from '../../core/chart.model';

import { select, selection, Selection, EnterElement, BaseType } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { color } from 'd3-color';
import { transition } from 'd3-transition';
import { element } from 'protractor';

type GroupsContainerType = Selection<Element | EnterElement | Document | Window, IPcacData, Element | EnterElement | Document | Window, {}>;
type GroupType = Selection<Element |
  EnterElement |
  Document |
  Window,
  IPcacData,
  Element |
  EnterElement |
  Document |
  Window,
  IPcacData>;

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
      .padding(0.2)
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
    this.addGroups(config);
  }

  private addGroups(config: IPcacBarVerticalChartConfig) {
    const groupsContainer = this.svg.append('g')
      .attr('class', 'pc-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pc-bar-group')
      .attr('transform', (d: IPcacData, i: number) => {
        return 'translate(' + this.xScaleStacked(d.key as string) + ',0)';
      });

    const group = groupsContainer.selectAll('rect')
      .data((d: IPcacData) => {
        return d.data;
      });

    this.drawBarsPerGroup(group, config);

    // We have no thresholds to draw
    if (!config.thresholds) {
      return;
    }

    // Draw threshold across entire chart
    if (config.thresholds.length === 1 && !config.thresholds[0].data) {
      this.drawThresholdAcrossChart(config);
    }

    // Draw threshold across each group
    if (config.thresholds.length > 1 && !config.thresholds[0].data) {
    }

    // Draw threshold across each bar in group
    if (config.thresholds.length > 1 && config.thresholds[0].data) {
      this.drawThresholdsPerGroup(group, config);
    }
  }

  private drawBarsPerGroup(group: GroupType, config: IPcacBarVerticalChartConfig) {
    const self = this;
    group.enter().append('rect')
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
      .attr('height', (d: IPcacData) => {
        return this.height - this.yScale(d.value as number);
      });
  }

  private drawThresholdAcrossChart(config: IPcacBarVerticalChartConfig) {
    const rect = this.applyPreTransitionThresholdStyles(this.svg.select('.pc-bars').append('rect'));
    rect.attr('width', this.width)
      .attr('y', () => {
        return this.height;
      })
      .on('mousemove', (d: IPcacData, i: number) => {
        this.tooltipBuilder.showBarTooltip(config.thresholds[0]);
      })
      .on('mouseout', (d: IPcacData, i: number) => {
        this.tooltipBuilder.hideTooltip();
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: IPcacData) => {
        return this.yScale(config.thresholds[0].value as number);
      })
      .attr('height', (d: IPcacData) => {
        return '2px';
      });
  }

  private drawThresholdsPerGroup(group: GroupType, config: IPcacBarVerticalChartConfig) {
    const self = this;
    group.enter().append('rect')
      .attr('class', 'pcac-threshold')
      .attr('x', (d: IPcacData) => {
        return config.isGroup ? this.xScaleGrouped(d.key as string) : this.xScaleStacked(d.key as string);
      })
      .style('fill', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', (d: IPcacData, i: number, n: any) => {
        return 2;
      })
      .attr('width', config.isGroup ? this.xScaleGrouped.bandwidth() : this.xScaleStacked.bandwidth())
      .attr('y', () => {
        return this.height;
      })
      .attr('height', 0)
      .on('mouseover', function (d: IPcacData, i: number) {
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
          .style('fill', color(self.colorService.getAlert()).darker(1).toString());
      })
      .on('mousemove', function (d: IPcacData, i: number) {
        self.tooltipBuilder.showBarTooltip(d);
      })
      .on('mouseout', function (d: IPcacData, i: number) {
        self.tooltipBuilder.hideTooltip();
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
          .style('fill', self.colorService.getAlert());
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: IPcacData) => {
        return this.yScale(d.value as number);
      })
      .attr('height', (d: IPcacData) => {
        return '2px';
      });
  }

  private applyPreTransitionThresholdStyles(elm: Selection<BaseType, {}, HTMLElement, any>) {
    return elm.attr('class', 'pcac-threshold')
      .attr('height', 0)
      .style('fill', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', (d: IPcacData, i: number, n: any) => {
        return 2;
      });
  }
}
