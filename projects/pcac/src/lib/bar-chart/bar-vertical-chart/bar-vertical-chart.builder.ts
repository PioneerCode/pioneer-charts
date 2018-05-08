import { Injectable, ElementRef } from '@angular/core';

import { select, selection, Selection, EnterElement, BaseType } from 'd3-selection';
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { color } from 'd3-color';
import { transition } from 'd3-transition';
import { element } from 'protractor';

/**
 * Lib
 */
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import {
  PcacChart,
  IPcacData,
  PcacAxisBuilder,
  PcacGridBuilder,
  PcacColorService,
  PcacTooltipBuilder,
  PcacTransitionService,
  PcacTickFormatEnum
} from '../../core';

import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

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
  private xScaleStacked: ScaleBand<string>;
  private xScaleGrouped: ScaleBand<string>;
  private yScale: ScaleLinear<number, number>;
  private barClickedSource = new Subject<IPcacData>();
  barClicked$ = this.barClickedSource.asObservable();

  constructor(
    public axisBuilder: PcacAxisBuilder,
    public gridBuilder: PcacGridBuilder,
    public transitionService: PcacTransitionService,
    public tooltipBuilder: PcacTooltipBuilder,
    public colorService: PcacColorService
  ) {
    super(
      axisBuilder,
      gridBuilder,
      transitionService,
      tooltipBuilder,
      colorService
    );
  }

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
      yScale: this.yScale,
      xFormat: PcacTickFormatEnum.None,
      yFormat: config.tickFormat || PcacTickFormatEnum.None
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
      .attr('class', 'pcac-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pcac-bar-group')
      .attr('data-group-id', (d: IPcacData, i: number) => {
        return i;
      })
      .attr('transform', (d: IPcacData, i: number) => {
        return 'translate(' + this.xScaleStacked(d.key as string) + ',0)';
      });

    const group = groupsContainer.selectAll('rect')
      .data((d: IPcacData, i: number) => {
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

  private drawBarsPerGroup(group: GroupType, config: IPcacBarVerticalChartConfig) {
    const self = this;
    group.enter().append('rect')
      .attr('class', 'pcac-bar')
      .attr('x', (d: IPcacData) => {
        return !config.isStacked ? this.xScaleGrouped(d.key as string) : this.xScaleStacked(d.key as string);
      })
      .style('fill', (d: IPcacData, i: number, n: any) => {
        return this.colors[i];
      })
      .attr('width', !config.isStacked ? this.xScaleGrouped.bandwidth() : this.xScaleStacked.bandwidth())
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
        self.tooltipBuilder.showBarTooltip(d, config.tickFormat || PcacTickFormatEnum.None);
      })
      .on('mouseout', function (d: IPcacData, i: number) {
        self.tooltipBuilder.hideTooltip();
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
          .style('fill', self.colors[i]);
      })
      .on('click', (d: IPcacData, i: number) => {
        this.barClickedSource.next(d);
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
    this.applyPreTransitionThresholdStyles(this.svg.select('.pcac-bars').append('rect'), config)
      .attr('width', this.width)
      .on('mousemove', (d: IPcacData, i: number) => {
        this.tooltipBuilder.showBarTooltip(config.thresholds[i], config.tickFormat || PcacTickFormatEnum.None);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: IPcacData, i: number) => {
        return this.yScale(config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerGroup(group: GroupType, config: IPcacBarVerticalChartConfig) {
    const self = this;
    this.applyPreTransitionThresholdStyles(this.svg.selectAll('.pcac-bar-group').append('rect'), config)
      .attr('width', this.xScaleStacked.bandwidth())
      .on('mousemove', (d: IPcacData, i: number) => {
        this.tooltipBuilder.showBarTooltip(config.isStacked ?
          config.thresholds[i].data[0] :
          config.thresholds[i],
          config.tickFormat || PcacTickFormatEnum.None
        );
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: IPcacData, i: number) => {
        return this.yScale(config.isStacked ? config.thresholds[i].data[0].value as number : config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerBarInGroup(group: GroupType, config: IPcacBarVerticalChartConfig) {
    const self = this;
    this.applyPreTransitionThresholdStyles(group.enter().append('rect'), config)
      .on('mousemove', (d: IPcacData, i: number, n: any) => {
        this.tooltipBuilder.showBarTooltip(
          config.thresholds[n[0].parentElement.dataset['groupId']].data[i],
          config.tickFormat || PcacTickFormatEnum.None
        );
      })
      .attr('width', this.xScaleGrouped.bandwidth())
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: IPcacData, i: number, n: any) => {
        return this.yScale(config.thresholds[n[0].parentElement.dataset['groupId']].data[i].value as number);
      });
  }

  private applyPreTransitionThresholdStyles(elm: Selection<BaseType, {}, HTMLElement, any> | any, config: IPcacBarVerticalChartConfig) {
    return elm.attr('class', 'pcac-threshold')
      .attr('x', (d: IPcacData) => {
        return this.xScaleGrouped(d ? d.key as string : '');
      })
      .attr('y', () => {
        return this.height;
      })
      .attr('height', 0)
      .style('fill', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke', (d: IPcacData, i: number, n: any) => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', (d: IPcacData, i: number, n: any) => {
        return 2;
      })
      .on('mouseout', (d: IPcacData, i: number) => {
        this.tooltipBuilder.hideTooltip();
      })
      .attr('height', (d: IPcacData) => {
        return '3px';
      });
  }
}
