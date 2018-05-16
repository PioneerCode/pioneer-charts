import { Injectable, ElementRef } from '@angular/core';

import { transition } from 'd3-transition';
import { select, selection } from 'd3-selection';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { line, Line, area, Area } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { range } from 'd3-array';

import { Observable, Subject } from 'rxjs';

/**
 * Lib
 */
import { LineAreaChartEffectsBuilder } from './line-area-chart-effects.builders';
import { IPcacLineAreaChartConfig } from './line-area-chart.model';
import { PcacAxisBuilder } from '../core/axis.builder';
import { PcacGridBuilder } from '../core/grid.builder';
import { PcacTransitionService } from '../core/transition.service';
import { PcacTooltipBuilder } from '../core/tooltip.builder';
import { PcacColorService } from '../core/color.service';
import { PcacChart } from '../core/chart';
import { IPcacData } from '../core/chart.model';

export interface ILineAreaChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacLineAreaChartConfig): void;
}

@Injectable()
export class LineAreaChartBuilder extends PcacChart implements ILineAreaChartBuilder {
  private line: Line<[number, number]>;
  private area: Area<[number, number]>;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private dotClickedSource = new Subject<IPcacData>();
  private originalHeight: number;
  dotClicked$ = this.dotClickedSource.asObservable();

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

  buildChart(chartElm: ElementRef, config: IPcacLineAreaChartConfig): void {
    this.startData = range(config.data[0].data.length).map((d) => {
      return {
        value: 0,
        key: ''
      };
    });

    if (config.hideAxis) {
      this.adjustForHiddenAxis(config);
    }

    this.initializeChartState(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private adjustForHiddenAxis(config: IPcacLineAreaChartConfig) {
    if (!this.originalHeight) {
      // Cache original height for recalculation of hidden axis height.
      this.originalHeight = config.height;
    }
    config.height = this.originalHeight + 12;
    this.margin.top = 8;
    this.margin.bottom = 8;
    this.margin.left = 8;
    this.margin.right = 8;
  }

  private buildScales(config: IPcacLineAreaChartConfig): void {
    this.xScale = scaleLinear()
      .domain([0, config.data[0].data.length - 1])
      .range([0, this.width]);

    this.yScale = scaleLinear()
      .domain([0, config.domainMax])
      .range([this.height, 0]);

    this.line = line()
      .x((d, i) => {
        return this.xScale(i);
      })
      .y((d: any) => {
        return this.yScale(d.value);
      });

    this.area = area()
      .x((d, i) => {
        return this.xScale(i);
      })
      .y0(this.height)
      .y1((d: any) => {
        return this.yScale(d.value);
      });
  }

  private drawChart(chartElm: ElementRef, config: IPcacLineAreaChartConfig): void {
    this.buildContainer(chartElm);
    if (!config.hideAxis) {
      this.axisBuilder.drawAxis({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        height: this.height,
        xScale: this.xScale,
        yScale: this.yScale
      });
    }
    if (!config.hideGrid) {
      this.gridBuilder.drawHorizontalGrid({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        width: this.width,
        xScale: this.xScale,
        yScale: this.yScale
      });
    }
    this.drawLineArea(config);
    if (config.enableEffects) {
      this.drawEffects(config);
    }
    this.drawDots(config);
  }

  private drawLineArea(config: IPcacLineAreaChartConfig): void {
    for (let i = 0; i < config.data.length; i++) {
      if (config.isArea) {
        this.drawArea(config.data[i].data, i);
      }
      this.drawLine(config.data[i].data, i);
    }
  }

  private drawLine(lineData: IPcacData[], index: number): void {
    this.svg.append('g')
      .attr('class', 'lines')
      .append('path')
      .datum(lineData)
      .attr('class', 'line')
      .attr('d', this.line(this.startData))
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('d', this.line as any) // TODO: strongly type
      .attr('stroke', () => {
        return this.colors[index];
      })
      .attr('fill', 'none');
  }

  private drawArea(lineData: IPcacData[], index: number) {
    this.svg.append('g')
      .attr('class', 'areas')
      .append('path')
      .datum(lineData)
      .attr('class', 'area')
      .style('opacity', 0.5)
      .style('fill', () => {
        return this.colors[index];  // TODO: strongly type
      })
      .attr('d', this.line(this.startData))
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attr('d', this.area as any);  // TODO: strongly type
  }

  private drawEffects(config: IPcacLineAreaChartConfig) {
    if (config.enableEffects) {
      const effectsBuilder = new LineAreaChartEffectsBuilder();
      effectsBuilder.buildEffects({
        svg: this.svg,
        height: this.height,
        width: this.width,
        data: config.data,
        colors: this.colors,
        x: this.xScale,
        y: this.yScale
      });
    }
  }

  private drawDots(config: IPcacLineAreaChartConfig): void {
    const self = this;
    for (let index = 0; index < config.data.length; index++) {
      this.svg.append('g')
        .attr('class', 'dots')
        .selectAll('.dot')
        .data(config.data[index].data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('stroke', (d: IPcacData) => {
          return this.colors[index];
        })
        .attr('cx', (d: IPcacData, i: number) => {
          return this.xScale(i);
        })
        .attr('cy', (d: IPcacData) => {
          return this.yScale(0);
        })
        .attr('fill', '#fff')
        .on('mouseover', function (d: IPcacData) {
          self.tooltipBuilder.showBarTooltip(d);
          select(this).transition(transition()
            .duration(self.transitionService.getTransitionDuration() / 3))
            .attr('r', 6)
            .attr('fill', self.colors[index]);
        })
        .on('mouseout', function () {
          self.tooltipBuilder.hideTooltip();
          select(this).transition(transition()
            .duration(self.transitionService.getTransitionDuration() / 3))
            .attr('r', 4)
            .attr('fill', '#fff');
        })
        .on('click', (d: IPcacData, i: number) => {
          this.dotClickedSource.next(d);
        })
        .transition(transition()
          .duration(this.transitionService.getTransitionDuration()))
        .attr('cy', (d: IPcacData) => {
          return this.yScale(d.value as number);
        })
        .attr('r', 4);
    }
  }
}
