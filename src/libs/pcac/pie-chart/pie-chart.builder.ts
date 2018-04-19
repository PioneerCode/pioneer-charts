import { Injectable, ElementRef } from '@angular/core';
import { arc, pie, DefaultArcObject } from 'd3-shape';
import { select } from 'd3-selection';
import { IPcacPieChartConfig } from './pie-chart.model';
import { PcacChart } from '../core/chart';
import { IPcacData } from '../core/chart.model';
import * as d3 from 'd3';

export interface IPieChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void;
}

@Injectable()
export class PieChartBuilder extends PcacChart implements IPieChartBuilder {
  private radius: number;
  private arcShape;   // TODO: Strongly type
  private pieAngles;   // TODO: Strongly type

  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.initializeChartState(chartElm, config);
    this.radius = Math.min(Math.min(this.height, this.width), Math.min(this.height, this.width)) / 2;
    this.buildShapes(config);
    this.drawChart(chartElm, config);
  }

  private buildShapes(config: IPcacPieChartConfig): void {
    this.arcShape = arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);

    this.pieAngles = pie()
      .sort(null)
      .value((d: any) => d.value);  // TODO: Strongly type
  }

  private drawChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.buildContainer(chartElm, true);
    this.svg.selectAll('.pcac-arc')
      .data(this.pieAngles(config.data))
      .enter().append('g')
      .attr('class', 'pcac-arc')
      .append('path')
      .style('fill', (d: any, i: number) => {    // TODO: Strongly type
        return this.colors[i];
      })
      .transition()
      .ease(d3.easeSin)
      .duration(750)
      .attrTween('d', (b: any) => {
        return this.tweenChart(b);
      })
      .transition()
      .delay((d, i) => {
        return i * 500;
      });
  }

  private tweenChart(b: any) {
    b.innerRadius = 0;
    const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
    return (t: any) => this.arcShape(i(t));
  }
}
