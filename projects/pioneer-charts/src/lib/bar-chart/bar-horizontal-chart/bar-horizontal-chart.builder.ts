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
import { IPcacGridBuilderConfig, PcacGridBuilder } from '../../core/grid.builder';
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

@Injectable({
  providedIn: 'root',
})
export class BarHorizontalChartBuilder extends PcacChart {

  private xScale!: ScaleLinear<number, number>;
  private yScaleStacked!: ScaleBand<string>;
  private yScaleGrouped!: ScaleBand<string>;
  private barClickedSource = new Subject<IPcacData>();
  private config!: IPcacBarHorizontalChartConfig;
  private cachedMargins: any;
  barClicked$ = this.barClickedSource.asObservable();

  constructor(
    public override axisBuilder: PcacAxisBuilder,
    public override gridBuilder: PcacGridBuilder,
    public override transitionService: PcacTransitionService,
    public override tooltipBuilder: PcacTooltipBuilder,
    public override colorService: PcacColorService
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
      } as IPcacGridBuilderConfig);
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
      .attr('transform', (d: IPcacData) => 'translate(0,' + this.yScaleStacked(d.key as string) + ')');

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
        let value = !config.isStacked ? this.yScaleGrouped(d.key as string) : this.yScaleStacked(d.key as string)
        return value ? value : 0;
      })
      .attr('data-group-bar-id', (_: IPcacData, i: number) => {
        return i;
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
      .on('mouseover', function (this: any, event: MouseEvent, d: IPcacData) {
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 7.5))
          .style('fill', () => {
            if (config.spreadColorsPerGroup) {
              const groupIndex = parseInt(this.parentNode.getAttribute('data-group-id'), 10);
              const c = color(self.colors[groupIndex])
              const ct = c ? c.darker(1).toString() : self.colors[groupIndex]
              return ct
            }
            const groupIndex = parseInt(this.getAttribute('data-group-bar-id'), 10);
            const c = color(self.colors[groupIndex])
            const ct = c ? c.darker(1).toString() : self.colors[groupIndex]
            return ct
          });
      })
      .on('mousemove', (event: MouseEvent, d: IPcacData) => {
        self.tooltipBuilder.showBarTooltip(event, d, config.tickFormat || PcacTickFormatEnum.None);
      })
      .on('mouseout', function (this: any, event: MouseEvent, d: IPcacData) {
        self.tooltipBuilder.hideTooltip();
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
          .style('fill', () => {
            if (config.spreadColorsPerGroup) {
              const groupIndex = parseInt(this.parentNode.getAttribute('data-group-id'), 10);
              return self.colors[groupIndex];
            }
            const groupIndex = parseInt(this.getAttribute('data-group-bar-id'), 10);
            return self.colors[groupIndex];
          });
      })
      .on('click', (d: IPcacData) => {
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
      .attr('data-group-threshold-id', (_: IPcacData, i: number) => {
        return i;
      })
      .on('mousemove', (event: MouseEvent, _: IPcacData) => {
        this.tooltipBuilder.showBarTooltip(event, config.thresholds[0], config.tickFormat || PcacTickFormatEnum.None);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('x', (d: IPcacData, i: number) => {
        return this.xScale(config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerGroup(group: GroupType, config: IPcacBarHorizontalChartConfig) {
    const self = this
    this.applyPreTransitionThresholdStyles(this.svg.selectAll('.pcac-bar-group').append('rect'), config)
      .attr('height', this.yScaleStacked.bandwidth())
      .attr('data-group-threshold-id', (_: IPcacData, i: number) => {
        return i;
      })
      .on('mousemove', function (this: any, event: MouseEvent, d: IPcacData, i: number) {
        const index = Number(this.parentElement.dataset['groupId'])
        self.tooltipBuilder.showBarTooltip(event,
          config.isStacked ?
            config.thresholds[index].data[0] :
            config.thresholds[index],
          config.tickFormat || PcacTickFormatEnum.None
        );
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('x', (_: IPcacData, i: number) => {
        return this.xScale(config.isStacked ? config.thresholds[i].data[0].value as number : config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerBarInGroup(group: GroupType, config: IPcacBarHorizontalChartConfig) {
    const self = this
    this.applyPreTransitionThresholdStyles(group.enter().append('rect'), config)
      .attr('data-group-threshold-id', (_: IPcacData, i: number) => {
        return i;
      })
      .attr('height', this.yScaleGrouped.bandwidth())
      .on('mousemove', function (this: any, event: MouseEvent, d: IPcacData, i: number, n: any) {
        const target = event.target as Element
        const index = Number(target.getAttribute("data-group-threshold-id"))
        self.tooltipBuilder.showBarTooltip(event,
          config.thresholds[Number(this.parentElement.dataset['groupId'])].data[index],
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
