import { Injectable, ElementRef } from '@angular/core';

import { select, Selection, EnterElement, BaseType } from 'd3-selection';
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { color } from 'd3-color';
import { transition } from 'd3-transition';

/**
 * Lib
 */
import { PcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { PcacAxisBuilder } from '../../core/axis.builder';
import { IPcacGridBuilderConfig, PcacGridBuilder } from '../../core/grid.builder';
import { PcacTransitionService } from '../../core/transition.service';
import { PcacTooltipBuilder } from '../../core/tooltip.builder';
import { PcacColorService } from '../../core/color.service';
import { PcacChart } from '../../core/chart';
import { PcacData, PcacFormatEnum } from '../../core/chart.model';

import { Subject } from 'rxjs';

type GroupType = Selection<Element |
  EnterElement |
  Document |
  Window,
  PcacData,
  Element |
  EnterElement |
  Document |
  Window,
  PcacData>;

export interface IBarVerticalChartBuilder {
  buildChart(chartElm: ElementRef, config: PcacBarVerticalChartConfig): void;
}

@Injectable({
  providedIn: 'root',
})
export class BarVerticalChartBuilder extends PcacChart {
  private xScaleStacked!: ScaleBand<string>;
  private xScaleGrouped!: ScaleBand<string>;
  private yScale!: ScaleLinear<number, number>;
  private barClickedSource = new Subject<PcacData>();
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

  buildChart(chartElm: ElementRef, config: PcacBarVerticalChartConfig): void {
    if (config.colorOverride && config.colorOverride.colors) {
      this.colors = config.colorOverride.colors;
    }
    if (config.hideAxis) {
      this.adjustForHiddenAxis(config);
    }
    this.initializeChartState(chartElm, config);
    if (config.colorOverride && config.colorOverride.colors) {
      this.colors = config.colorOverride.colors.reverse();
    }
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private adjustForHiddenAxis(config: PcacBarVerticalChartConfig) {
    const hasGroupLabel = this.hasGroupLabel(config);

    config.height = config.height + this.margin.top;
    if (!hasGroupLabel) {
      config.height = config.height + this.margin.bottom;
    }
    this.margin.top = 0;
    this.margin.bottom = hasGroupLabel ? this.margin.bottom : 0;
    this.margin.left = 0;
    this.margin.right = 0;
  }

  private hasGroupLabel(config: PcacBarVerticalChartConfig) {
    let hasGroupLabel = false;
    config.data.forEach(node => {
      if (node.key) {
        hasGroupLabel = true;
      }
    });
    return hasGroupLabel;
  }

  private buildScales(config: PcacBarVerticalChartConfig) {
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

  private drawChart(chartElm: ElementRef, config: PcacBarVerticalChartConfig): void {
    this.buildContainer(chartElm);
    this.axisBuilder.drawAxis({
      svg: this.svg,
      numberOfTicks: config.numberOfTicks || 5,
      height: this.height,
      xScale: this.xScaleStacked,
      yScale: this.yScale,
      xFormat: PcacFormatEnum.None,
      yFormat: config.tickFormat || PcacFormatEnum.None,
      hideYAxis: config.hideAxis
    });
    if (!config.hideGrid) {
      this.gridBuilder.drawHorizontalGrid({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        width: this.width,
        xScale: this.xScaleStacked,
        yScale: this.yScale
      } as IPcacGridBuilderConfig);
    }
    this.addGroups(config);
  }

  private addGroups(config: PcacBarVerticalChartConfig) {
    const groupsContainer = this.svg.append('g')
      .attr('class', 'pcac-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pcac-bar-group')
      .attr('data-group-id', (d: PcacData, i: number) => {
        return i;
      })
      .attr('transform', (d: PcacData, i: number) => {
        return 'translate(' + this.xScaleStacked(d.key as string) + ',0)';
      });

    const group = groupsContainer.selectAll('rect')
      .data((d: PcacData, i: number) => {
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

  private drawBarsPerGroup(group: GroupType, config: PcacBarVerticalChartConfig) {
    const self = this;
    group.enter().append('rect')
      .attr('class', 'pcac-bar')
      .attr('x', (d: PcacData, i: number) => {
        let value = !config.isStacked ? this.xScaleGrouped(d.key as string) : this.xScaleStacked(d.key as string)
        return value ? value : 0;
      })
      .attr('data-group-bar-id', (_: PcacData, i: number) => {
        return i;
      })
      .style('fill', (d: PcacData, i: number, n: any) => {
        if (config.spreadColorsPerGroup) {
          const groupIndex = parseInt(n[0].parentNode.getAttribute('data-group-id'), 10);
          return this.colors[groupIndex];
        }
        return this.colors[i];
      })
      .attr('y', () => {
        return this.height;
      })
      .attr('height', 0)
      .on('mouseover', function (this: any, event: MouseEvent, d: PcacData) {
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 5))
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
      .on('mousemove', (event: MouseEvent, d: PcacData) => {
        self.tooltipBuilder.showBarTooltip(event, d, config.tickFormat || PcacFormatEnum.None);
      })
      .on('mouseout', function (this: any, d: PcacData) {
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
      .on('click', (_, d: PcacData) => {
        this.barClickedSource.next(d);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('width', !config.isStacked ? this.xScaleGrouped.bandwidth() : this.xScaleStacked.bandwidth())
      .attr('y', (d: PcacData) => {
        return this.yScale(d.value as number);
      })
      .attr('height', (d: PcacData) => {
        return this.height - this.yScale(d.value as number);
      });
  }

  private drawThresholdAcrossChart(config: PcacBarVerticalChartConfig) {
    this.applyPreTransitionThresholdStyles(this.svg.select('.pcac-bars').append('rect'), config)
      .attr('width', this.width)
      .attr('data-group-threshold-id', (_: PcacData, i: number) => {
        return i;
      })
      .on('mousemove', (event: MouseEvent, d: PcacData, i: number) => {
        this.tooltipBuilder.showBarTooltip(event, config.thresholds[0], config.tickFormat || PcacFormatEnum.None);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: PcacData, i: number) => {
        return this.yScale(config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerGroup(group: GroupType, config: PcacBarVerticalChartConfig) {
    const self = this
    this.applyPreTransitionThresholdStyles(this.svg.selectAll('.pcac-bar-group').append('rect'), config)
      .attr('width', this.xScaleStacked.bandwidth())
      .attr('data-group-threshold-id', (_: PcacData, i: number) => {
        return i;
      })
      .on('mousemove', function (this: any, event: MouseEvent) {
        const index = Number(this.parentElement.dataset['groupId'])
        self.tooltipBuilder.showBarTooltip(event, config.isStacked ?
          config.thresholds[index].data[0] :
          config.thresholds[index],
          config.tickFormat || PcacFormatEnum.None
        );
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: PcacData, i: number) => {
        return this.yScale(config.isStacked ? config.thresholds[i].data[0].value as number : config.thresholds[i].value as number);
      });
  }

  private drawThresholdsPerBarInGroup(group: GroupType, config: PcacBarVerticalChartConfig) {
    const self = this
    this.applyPreTransitionThresholdStyles(group.enter().append('rect'), config)
      .attr('data-group-threshold-id', (_: PcacData, i: number) => {
        return i;
      })
      .on('mousemove', function(this: any, event: MouseEvent, _: PcacData)  {
        const target = event.target as Element
        const index = Number(target.getAttribute("data-group-threshold-id"))
        self.tooltipBuilder.showBarTooltip(
          event,
          config.thresholds[Number(this.parentElement.dataset['groupId'])].data[index],
          config.tickFormat || PcacFormatEnum.None
        );
      })
      .attr('width', this.xScaleGrouped.bandwidth())
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('y', (d: PcacData, i: number, n: any) => {
        return this.yScale(config.thresholds[n[0].parentElement.dataset['groupId']].data[i].value as number);
      });
  }

  private applyPreTransitionThresholdStyles(elm: Selection<BaseType, {}, HTMLElement, any> | any, config: PcacBarVerticalChartConfig) {
    return elm.attr('class', 'pcac-threshold')
      .attr('x', (d: PcacData) => {
        return this.xScaleGrouped(d ? d.key as string : '');
      })
      .attr('y', () => {
        return this.height;
      })
      .attr('height', 0)
      .style('fill', () => {
        return this.colorService.getAlert();
      })
      .style('stroke', () => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', () => {
        return 2;
      })
      .on('mouseout', () => {
        this.tooltipBuilder.hideTooltip();
      })
      .attr('height', () => {
        return '3px';
      });
  }
}
