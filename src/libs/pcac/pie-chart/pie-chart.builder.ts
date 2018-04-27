import { Injectable, ElementRef } from '@angular/core';

/**
 * D3
 */
import { arc, pie, DefaultArcObject, Arc, Pie } from 'd3-shape';
import { select } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { transition } from 'd3-transition';

/**
 * Lib
 */
import { IPcacPieChartConfig } from './pie-chart.model';
import { PcacChart } from '../core/chart';
import { IPcacData } from '../core/chart.model';

export interface IPieChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void;
}

@Injectable()
export class PieChartBuilder extends PcacChart implements IPieChartBuilder {
  private radius: number;
  private arcShape: Arc<any, DefaultArcObject>;
  private arcOverShape: Arc<any, DefaultArcObject>;
  private pieAngles: Pie<any, number | {}>;

  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.initializeChartState(chartElm, config);
    this.radius = Math.min(Math.min(this.height, this.width), Math.min(this.height, this.width)) / 2;
    this.buildShapes(config);
    this.drawChart(chartElm, config);
  }

  private buildShapes(config: IPcacPieChartConfig): void {
    const radiusOffset = 10;

    this.arcShape = arc()
      .innerRadius(0)
      .outerRadius(this.radius - radiusOffset);

    this.arcOverShape = arc()
      .innerRadius(0)
      .outerRadius(this.radius - radiusOffset + radiusOffset);

    this.pieAngles = pie()
      .sort(null)
      .value((d: any) => d.value);  // TODO: Strongly type
  }

  private drawChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.buildContainer(chartElm, true);
    const self = this;
    this.svg.selectAll('.pcac-arc')
      .data(this.pieAngles(config.data))
      .enter().append('g')
      .attr('class', 'pcac-arc')
      .append('path')
      .style('fill', (d: any, i: number) => {  // TODO: Strongly type
        return this.colors[i];
      })
      .on('mouseover', function (d: any) {  // TODO: Strongly type
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 3))
          .attr('d', self.arcOverShape);
      })
      .on('mousemove', function (d: any) {  // TODO: Strongly type
        self.tooltipBuilder.showBarTooltip(d);
      })
      .on('mouseout', function () {
        self.tooltipBuilder.hideTooltip();
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 3))
          .attr('d', self.arcShape);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attrTween('d', (b: any) => {  // TODO: Strongly type
        return this.tweenChart(b);
      });
  }


  private tweenChart(b: any) {  // TODO: Strongly type
    b.innerRadius = 0;
    const i = interpolate({ startAngle: 0, endAngle: 0 }, b);
    return (t: any) => this.arcShape(i(t));  // TODO: Strongly type
  }
}
