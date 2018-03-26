import { Injectable, ElementRef } from '@angular/core';
import { IPcacLineAreaChartConfig } from './line-area-chart.model';
import { select, selection } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line, area } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { PcacColorService } from '../core/color.service';
import { PcacChart } from '../core/chart';
import { IPcacData } from '../core/chart.model';
export interface ILineAreaChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacLineAreaChartConfig): void;
}

@Injectable()
export class LineAreaChartBuilder extends PcacChart implements ILineAreaChartBuilder {
  private numberOfTicks = 5;
  private line: d3.Line<[number, number]>;
  private area: d3.Area<[number, number]>;
  private xScale: d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleLinear<number, number>;

  buildChart(chartElm: ElementRef, config: IPcacLineAreaChartConfig): void {
    this.prepCanvas(chartElm, config);
    this.buildScales(config);
    this.drawChart(chartElm, config);
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
    this.axisBuilder.drawAxis({
      svg: this.svg,
      numberOfTicks: this.numberOfTicks,
      height: this.height,
      xScale: this.xScale,
      yScale: this.yScale
    });
    this.gridBuilder.drawHorizontalGrid({
      svg: this.svg,
      numberOfTicks: this.numberOfTicks,
      width: this.width,
      xScale: this.xScale,
      yScale: this.yScale
    });
    this.drawLineArea(config);
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
      .attr('d', this.line as any) // TODO: strongly type
      .attr('stroke', () => {
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
      .style('fill', () => {
        return this.colors[index];  // TODO: strongly type
      })
      .attr('d', this.area as any);  // TODO: strongly type
  }

  private drawDots(config: IPcacLineAreaChartConfig): void {
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
          return this.yScale(d.value as number);
        })
        .attr('r', 4);
    }
  }
}
