import { Injectable, ElementRef } from '@angular/core';

import { transition } from 'd3-transition';
import { color } from 'd3-color';
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { select, Selection, EnterElement } from 'd3-selection';
import { BaseType } from 'd3-selection';

import { Subject } from 'rxjs';

/**
 * Lib
 */
import { IPcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { PcacAxisBuilder } from '../../core/axis.builder';
import { PcacGridBuilder } from '../../core/grid.builder';
import { PcacTransitionService } from '../../core/transition.service';
import { PcacTooltipBuilder } from '../../core/tooltip.builder';
import { PcacColorService } from '../../core/color.service';
import { PcacChart } from '../../core/chart';
import { IPcacData, PcacTickFormatEnum } from '../../core/chart.model';

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

  private xScale: ScaleLinear<number, number>;
  private yScaleStacked: ScaleBand<string>;
  private yScaleGrouped: ScaleBand<string>;
  private barClickedSource = new Subject<IPcacData>();
  private config: IPcacBarHorizontalChartConfig;
  private cachedMargins;
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

  buildChart(chartElm: ElementRef, config: IPcacBarHorizontalChartConfig): void {
    this.config = JSON.parse(JSON.stringify(config));
    if (this.config.hideAxis) {
      this.adjustForHiddenAxis();
    }
    this.initializeChartState(chartElm, this.config);
    if (config.colorOverride && config.colorOverride.colors) {
      this.colors = config.colorOverride.colors.reverse();
    }
    this.buildScales(chartElm, this.config);
    this.drawChart(chartElm, this.config);
  }

  private adjustForHiddenAxis() {
    if (!this.cachedMargins) {
      this.cachedMargins = JSON.parse(JSON.stringify(this.margin));
    }
    this.margin = JSON.parse(JSON.stringify(this.cachedMargins));
    this.config.height = this.config.height + this.margin.top + this.margin.bottom;
    this.margin.top = 0;
    this.margin.bottom = 0;
    this.margin.left = 0;
    this.margin.right = 0;
  }

  private setStartState(data: IPcacData): void {
    if (data && data.data) {
      for (let i = 0, l = data.data.length; i < l; ++i) {
        data.data[i].value = 0;
        this.setStartState(data.data[i]);
      }
    }
  }

  private buildScales(chartElm: ElementRef, config: IPcacBarHorizontalChartConfig) {
    config.data[0].data.map((d) => {
      return d.value;
    });

    this.xScale = scaleLinear()
      .domain([0, config.domainMax]);


    this.yScaleStacked = scaleBand()
      .domain(config.data.map((d) => d.key as string))
      .range([this.height, 0])
      .padding(0.1);

    this.yScaleGrouped = scaleBand()
      .padding(0.05)
      .rangeRound([0, this.yScaleStacked.bandwidth()])
      .domain(config.data[0].data.map((d) => d.key as string));

    this.setHorizontalMarginsBasedOnContent(chartElm, config.data, this.yScaleStacked);

    this.xScale.range([0, this.width]);
  }

  private drawChart(chartElm: ElementRef, config: IPcacBarHorizontalChartConfig): void {
    this.buildContainer(chartElm);
    this.axisBuilder.drawAxis({
      svg: this.svg,
      numberOfTicks: config.numberOfTicks || 5,
      height: this.height,
      xScale: this.xScale,
      yScale: this.yScaleStacked,
      xFormat: config.tickFormat || PcacTickFormatEnum.None,
      yFormat: PcacTickFormatEnum.None,
      hideXAxis: config.hideAxis
    });
    if (!config.hideGrid) {
      this.gridBuilder.drawVerticalGrid({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        height: this.height,
        xScale: this.xScale,
        yScale: this.yScaleStacked
      });
    }
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
      .style('fill', (d: IPcacData, i: number, n: any) => {
        if (config.spreadColorsPerGroup) {
          const groupIndex = parseInt(n[0].parentNode.getAttribute('data-group-id'), 10);
          return this.colors[groupIndex];
        }
        return this.colors[i];
      })
      .attr('width', 0)
      .on('mouseover', function (d: IPcacData, i: number, n: any) {
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 7.5))
          .style('fill', () => {
            if (config.spreadColorsPerGroup) {
              const groupIndex = parseInt(n[0].parentNode.getAttribute('data-group-id'), 10);
              return color(self.colors[groupIndex]).darker(1).toString();
            }
            return color(self.colors[i]).darker(1).toString();
          });
      })
      .on('mousemove', function (d: IPcacData, i: number) {
        self.tooltipBuilder.showBarTooltip(d, config.tickFormat || PcacTickFormatEnum.None);
      })
      .on('mouseout', function (d: IPcacData, i: number, n: any) {
        self.tooltipBuilder.hideTooltip();
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
          .style('fill', () => {
            if (config.spreadColorsPerGroup) {
              const groupIndex = parseInt(n[0].parentNode.getAttribute('data-group-id'), 10);
              return self.colors[groupIndex];
            }
            return self.colors[i];
          });
      })
      .on('click', (d: IPcacData, i: number) => {
        this.barClickedSource.next(d);
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
        this.tooltipBuilder.showBarTooltip(config.thresholds[i], config.tickFormat || PcacTickFormatEnum.None);
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
          config.thresholds[i],
          config.tickFormat || PcacTickFormatEnum.None
        );
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
        this.tooltipBuilder.showBarTooltip(
          config.thresholds[n[0].parentElement.dataset['groupId']].data[i],
          config.tickFormat || PcacTickFormatEnum.None
        );
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
      .style('fill', () => {
        return this.colorService.getAlert();
      })
      .style('stroke', () => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', () => {
        return 2;
      })
      .attr('width', '3px')
      .on('mouseout', () => {
        this.tooltipBuilder.hideTooltip();
      });
  }
}
