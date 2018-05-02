import { Injectable, ElementRef } from '@angular/core';

import { transition } from 'd3-transition';
import { color } from 'd3-color';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select, selection, Selection, EnterElement } from 'd3-selection';

import { PcacChart } from '../../core/chart';
import { IPcacData } from '../../core/chart.model';
import { PcacTransitionService } from '../../core/transition.service';
import { BaseType } from 'd3-selection';
import { IPcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';

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

@Injectable()
export class BarHorizontalChartBuilder extends PcacChart {

  private xScale: d3.ScaleLinear<number, number>;
  private yScaleStacked: d3.ScaleBand<string>;
  private yScaleGrouped: d3.ScaleBand<string>;

  buildChart(chartElm: ElementRef, config: IPcacBarHorizontalChartConfig): void {
    this.initializeChartState(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private setStartState(data: IPcacData): void {
    if (data && data.data) {
      for (let i = 0, l = data.data.length; i < l; ++i) {
        data.data[i].value = 0;
        this.setStartState(data.data[i]);
      }
    }
  }

  private buildScales(config: IPcacBarHorizontalChartConfig) {
    const barMap = config.data[0].data.map((d) => {
      return d.value;
    });

    this.xScale = scaleLinear()
      .domain([0, config.domainMax])
      .range([0, this.width]);

    this.yScaleStacked = scaleBand()
      .domain(config.data.map((d) => d.key as string))
      .range([this.height, 0])
      .padding(0.1);

    this.yScaleGrouped = scaleBand()
      .padding(0.05)
      .rangeRound([0, this.yScaleStacked.bandwidth()])
      .domain(config.data[0].data.map((d) => d.key as string));
  }

  private drawChart(chartElm: ElementRef, config: IPcacBarHorizontalChartConfig): void {
    this.setHorizontalMarginsBasedOnContent(chartElm, config.data, this.yScaleStacked);
    this.buildContainer(chartElm);
    this.axisBuilder.drawAxis({
      svg: this.svg,
      numberOfTicks: config.numberOfTicks || 5,
      height: this.height,
      xScale: this.xScale,
      yScale: this.yScaleStacked
    });
    this.gridBuilder.drawVerticalGrid({
      svg: this.svg,
      numberOfTicks: config.numberOfTicks || 5,
      height: this.height,
      xScale: this.xScale,
      yScale: this.yScaleStacked
    });
    this.addGroups(config);
  }

  private addGroups(config: IPcacBarHorizontalChartConfig) {
    const groupsContainer = this.svg.append('g')
      .attr('class', 'pcac-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pcac-bar-group')
      .attr('data-group-id', (d: IPcacData, i: number) => {
        return i;
      })
      .attr('transform', (d) => 'translate(0,' + this.yScaleStacked(d.key as string) + ')');

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
    if (config.thresholds.length > 1 && (!config.thresholds[0].data || config.isStacked)) {
      this.drawThresholdsPerGroup(group, config);
    }

    // Draw threshold across each bar in group
    if (config.thresholds.length > 1 && config.thresholds[0].data && !config.isStacked) {
      this.drawThresholdsPerBarInGroup(group, config);
    }
  }

  private drawBarsPerGroup(groups: GroupType, config: IPcacBarHorizontalChartConfig) {
    const self = this;
    groups.enter().append('rect')
      .attr('class', 'pcac-bar')
      .attr('x', 0)
      .attr('y', (d: IPcacData) => {
        return !config.isStacked ? this.yScaleGrouped(d.key as string) : this.yScaleStacked(d.key as string);
      })
      .attr('height', !config.isStacked ? this.yScaleGrouped.bandwidth() : this.yScaleStacked.bandwidth())
      .style('fill', (d: IPcacData, i: number) => {
        return this.colors[i];
      })
      .attr('width', 0)
      .on('mouseover', function (d: IPcacData, i: number) {
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 7.5))
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
      .attr('width', (d: IPcacData) => {
        return this.xScale(d.value as number);
      });
  }

  private drawThresholdAcrossChart(config: IPcacBarHorizontalChartConfig) {
    this.applyPreTransitionThresholdStyles(this.svg.select('.pcac-bars').append('rect'), config)
      .attr('height', this.height)
      .on('mousemove', (d: IPcacData, i: number) => {
        this.tooltipBuilder.showBarTooltip(config.thresholds[i]);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('x', (d: IPcacData, i: number) => {
        return this.xScale(config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerGroup(group: GroupType, config: IPcacBarHorizontalChartConfig) {
    this.applyPreTransitionThresholdStyles(this.svg.selectAll('.pcac-bar-group').append('rect'), config)
      .attr('height', this.yScaleStacked.bandwidth())
      .on('mousemove', (d: IPcacData, i: number) => {
        this.tooltipBuilder.showBarTooltip(config.isStacked ?
          config.thresholds[i].data[0] :
          config.thresholds[i]);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('x', (d: IPcacData, i: number) => {
        return this.xScale(config.isStacked ? config.thresholds[i].data[0].value as number : config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerBarInGroup(group: GroupType, config: IPcacBarHorizontalChartConfig) {
    this.applyPreTransitionThresholdStyles(group.enter().append('rect'), config)
      .attr('height', this.yScaleGrouped.bandwidth())
      .on('mousemove', (d: IPcacData, i: number, n: any) => {
        this.tooltipBuilder.showBarTooltip(config.thresholds[n[0].parentElement.dataset['groupId']].data[i]);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: IPcacData) => {
        return this.yScaleGrouped(d.key as string);
      })
      .attr('x', (d: IPcacData, i: number, n: any) => {
        return this.xScale(config.thresholds[n[0].parentElement.dataset['groupId']].data[i].value as number);
      });
  }

  private applyPreTransitionThresholdStyles(elm: Selection<BaseType, {}, HTMLElement, any> | any, config: IPcacBarHorizontalChartConfig) {
    return elm.attr('class', 'pcac-threshold')
      .style('fill', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', (d: IPcacData, i: number, n: any) => {
        return 2;
      })
      .attr('width', '3px')
      .on('mouseout', (d: IPcacData, i: number) => {
        this.tooltipBuilder.hideTooltip();
      });
  }
}
