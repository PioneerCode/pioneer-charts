import { Injectable, ElementRef } from '@angular/core';

import { ScaleTime, scaleTime } from 'd3';
import { select } from 'd3-selection';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { line, Line, area, Area } from 'd3-shape';
import { range } from 'd3-array';

import { Subject } from 'rxjs';

/**
 * Lib
 */
import { LineAreaChartEffectsBuilder } from './plot-line-area-chart-effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from './plot-line-area-chart.model';
import { IPcacAxisBuilderConfig } from '../core/axis.builder';
import { IPcacGridBuilderConfig } from '../core/grid.builder';
import { PcacChart } from '../core/chart';
import { PcacData, PcacFormatEnum } from '../core/chart.model';


@Injectable({
  providedIn: 'root',
})
export class LineAreaChartBuilder extends PcacChart {
  private line!: Line<[number, number]>;
  private area!: Area<[number, number]>;
  private xScale!: ScaleLinear<number, number> | ScaleTime<number, number, never>;
  private yScale!: ScaleLinear<number, number>;
  private dotClickedSource = new Subject<PcacData>();
  private config!: PcacLineAreaChartConfig;
  dotClicked$ = this.dotClickedSource.asObservable();


  buildChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    this.config = JSON.parse(JSON.stringify(config));



    this.startData = range(this.config.data[0].data.length).map((d) => {
      return {
        value: 0,
        key: ''
      };
    });
    if (this.config.hideAxis) {
      this.adjustForHiddenAxis();
    }
    
    this.initializeChartState(chartElm, this.config);
    if (this.config.colorOverride) {
      this.colors = this.config.colorOverride;
    }

    this.buildScales(this.config);
    this.drawChart(chartElm, this.config, type);
  }

  private adjustForHiddenAxis() {
    this.config.height = this.config.height + 12;
    this.margin.top = 8;
    this.margin.bottom = 8;
    this.margin.left = 8;
    this.margin.right = 8;
  }

  private buildScales(config: PcacLineAreaChartConfig): void {
    switch (config.xFormat) {
      case PcacFormatEnum.DateTime:
        this.xScale = scaleTime()
          .domain([new Date(config.xDomainMin), new Date(config.xDomainMax)])
          .range([0, this.width]);
        break
      case PcacFormatEnum.Decimal:
        this.xScale = scaleLinear()
          .domain([config.xDomainMin as number || 0, config.xDomainMax as number || 100])
          .range([0, this.width]);
        break
      case PcacFormatEnum.DatasetLength:
        this.xScale = scaleLinear()
          .domain([0, config.data[0].data.length - 1])
          .range([0, this.width]);
        break
      default:
        this.xScale = scaleLinear()
          .domain([0, config.data[0].data.length - 1])
          .range([0, this.width]);
    }

    this.yScale = scaleLinear()
      .domain([config.yDomainMin as number || 0, config.yDomainMax as number || 100])
      .range([this.height, 0]);

    this.line = line()
      .x((d: any, i) => {
        return this.getXFormat(config.xFormat, d, i)
      })
      .y((d: any) => {
        return this.yScale(d.value);
      });


    this.area = area()
      .x((d: any, i) => {
        return this.getXFormat(config.xFormat, d, i)
      })
      .y0(this.height)
      .y1((d: any) => {
        return this.yScale(d.value);
      });
  }

  private drawChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    this.buildContainer(chartElm);
    if (!config.hideAxis) {
      this.axisBuilder.drawAxis({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        height: this.height,
        xScale: this.xScale,
        yScale: this.yScale,
        yFormat: config.yFormat,
        xFormat: config.xFormat
      } as IPcacAxisBuilderConfig);
    }
    if (!config.hideGrid) {
      this.gridBuilder.drawHorizontalGrid({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        width: this.width,
        xScale: this.xScale,
        yScale: this.yScale
      } as IPcacGridBuilderConfig);
    }
    this.drawLineArea(config, type);
    if (config.enableEffects) {
      this.drawEffects(config);
    }
    this.drawDots(config);
  }

  private drawLineArea(config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    for (let i = 0; i < config.data.length; i++) {
      if (type === PcacLineAreaPlotChartConfigType.Area) {
        this.drawArea(config.data[i].data, i);
      } else if (type === PcacLineAreaPlotChartConfigType.Line) {
        this.drawLine(config.data[i].data, i, config.data[i].hide);
      }
    }
  }

  private drawLine(lineData: PcacData[], index: number, hide = false): void {
    this.svg.append('g')
      .attr('class', 'lines')
      .append('path')
      .datum(lineData)
      .attr('class', 'line')
      .attr('d', this.line(this.startData))
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('d', this.line as any) // TODO: strongly type
      .attr('stroke', () => {
        return this.colors[index];
      })
      .attr('fill', 'none')
      .attr('style', () => hide ? 'display: none' : null);
  }

  private drawArea(lineData: PcacData[], index: number) {
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
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('d', this.area as any);  // TODO: strongly type
  }

  private drawEffects(config: PcacLineAreaChartConfig) {
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

  private drawDots(config: PcacLineAreaChartConfig): void {
    const self = this;
    for (let index = 0; index < config.data.length; index++) {
      this.svg.append('g')
        .attr('class', 'dots')
        .selectAll('.dot')
        .data(config.data[index].data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('stroke', (d: PcacData) => {
          return this.colors[index];
        })
        .attr('cx', (d: PcacData, i: number) => {
          return this.getXFormat(config.xFormat, d, i)
        })
        .attr('cy', (d: PcacData) => {
          return this.yScale(0);
        })
        .attr('fill', '#fff')
        .on('mouseover', function (this: any, event: MouseEvent, d: PcacData) {
          self.tooltipBuilder.showBarTooltip(event, d, self.config.yFormat, self.config.xFormat);
          select(this)
            .transition()
            .duration(self.transitionService.getTransitionDuration() / 3)
            .attr('r', 6)
            .attr('fill', self.colors[index]);
        })
        .on('mouseout', function (this: any) {
          self.tooltipBuilder.hideTooltip();
          select(this)
            .transition()
            .duration(self.transitionService.getTransitionDuration() / 3)
            .attr('r', 4)
            .attr('fill', '#fff');
        })
        .on('click', (d: PcacData, i: number) => {
          this.dotClickedSource.next(d);
        })
        .transition()
        .duration(this.transitionService.getTransitionDuration())
        .attr('cy', (d: PcacData) => {
          return this.yScale(d.value as number);
        })
        .attr('r', 4)
        .attr('style', () => config.data[index].hide ? 'display: none' : null);
    }
  }

  private getXFormat(type: PcacFormatEnum, data: PcacData, index: number) {
    switch (type) {
      case PcacFormatEnum.DateTime:
        if (data.key) {
          return this.xScale(new Date(data.key));
        }
        return 0
      case PcacFormatEnum.Decimal:
        if (data.key) {
          return this.xScale(data.key as unknown as number);
        }
        return 0
      default:
        return this.xScale(index)
    }
  }
}
