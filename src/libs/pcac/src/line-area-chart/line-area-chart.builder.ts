import { Injectable, ElementRef } from '@angular/core';
import { ILineAreaChartConfig } from './line-area-chart.model';
import { select, selection, baseType } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line, area } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { IPcacData } from '../core';
import { PcacColorService } from '../core/color.service';
export interface ILineAreaChartBuilder {
  buildChart(chartElm: ElementRef, config: ILineAreaChartConfig): void;
}

@Injectable()
export class LineAreaChartBuilder implements ILineAreaChartBuilder {
  private width = 400;
  private height = 400;
  private margin = { top: 16, right: 16, bottom: 20, left: 40 };
  private axisTicks = 5;
  private svg: selection<baseType, {}, HTMLElement, any>;
  private line: line<[number, number]>;
  private area: area<[number, number]>;
  private xScale: scaleLinear<number, number>;
  private yScale: scaleLinear<number, number>;
  private colors = [] as string[];

  constructor(private colorService: PcacColorService) { }

  buildChart(chartElm: ElementRef, config: ILineAreaChartConfig): void {
    this.setup(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private setup(chartElm: ElementRef, config: ILineAreaChartConfig): void {
    select(chartElm.nativeElement).select('g').remove();
    this.width = chartElm.nativeElement.parentNode.clientWidth - this.margin.left - this.margin.right;
    this.height = chartElm.nativeElement.parentNode.clientHeight - this.margin.top - this.margin.bottom;
    this.colors = this.colorService.getColorScale(config.data.length);
  }

  private buildScales(config: ILineAreaChartConfig): void {
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

  private drawChart(chartElm: ElementRef, config: ILineAreaChartConfig): void {
    this.prepSvg(chartElm);
    this.drawAxis();
    this.drawGrid();
    this.drawData(config);
  }

  private prepSvg(chartElm: ElementRef): void {
    this.svg = select(chartElm.nativeElement)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private drawAxis(): void {
    this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(axisBottom(this.xScale)
        .tickFormat((d: any, i: number) => {
          return d + 1;
        }).ticks(this.axisTicks)
      );

    this.svg.append('g')
      .attr('class', 'y-axis')
      .call(axisLeft(this.yScale).ticks(this.axisTicks));
  }

  private drawGrid(): void {
    this.svg.append('g')
      .attr('class', 'rules')
      .selectAll('g.rule')
      .data(this.yScale.ticks(this.axisTicks))
      .enter().append('svg:g')
      .attr('class', 'rule')
      .append('svg:line')
      .attr('y1', (d: number) => this.yScale(d))
      .attr('y2', (d: number) => this.yScale(d))
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('class', (d: number, i: number) => (i === 0 ? 'last' : 'other'));
  }

  private drawData(config: ILineAreaChartConfig): void {
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
      .attr('d', this.line)
      .attr('stroke', (d: IPcacData) => {
        return this.colors[index];
      });
  }

  private drawArea(lineData: IPcacData[], index: number) {
    this.svg.append('g')
      .attr('class', 'areas')
      .append('path')
      .datum(lineData)
      .attr('class', 'area')
      .style('opacity', 0.5)
      .style('fill', (d:  IPcacData) => {
        return this.colors[index];
      })
      .attr('d', this.area);
  }
}
