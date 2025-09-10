import { Injectable, ElementRef } from '@angular/core';

/**
 * D3
 */
import { arc, pie, DefaultArcObject, Arc, Pie, PieArcDatum } from 'd3-shape';
import { select } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { transition } from 'd3-transition';
import { color } from 'd3-color';

/**
 * Lib
 */
import { PcacPieChartConfig } from './pie-chart.model';
import { PcacChart } from '../core/chart';
import { PcacData } from '../core/chart.model';

import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class PieChartBuilder extends PcacChart {
  private radius!: number;
  private arcShape!: Arc<any, DefaultArcObject> | any;
  private arcOverShape!: Arc<any, DefaultArcObject> | any;
  private pieAngles!: Pie<any, number | {}> | any;
  private sliceClickedSource = new Subject<PcacData>();
  sliceClicked$ = this.sliceClickedSource.asObservable();

  buildChart(chartElm: ElementRef, config: PcacPieChartConfig): void {
    this.initializeChartState(chartElm, config);
    this.radius = Math.min(Math.min(this.height, this.width), Math.min(this.height, this.width)) / 2;
    this.buildShapes(config);
    this.drawChart(chartElm, config);
  }

  private buildShapes(config: PcacPieChartConfig): void {
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

  private drawChart(chartElm: ElementRef, config: PcacPieChartConfig): void {
    this.buildContainer(chartElm, true);
    const self = this;
    this.svg.selectAll('.pcac-arc')
      .data(this.pieAngles(config.data))
      .enter().append('g')
      .attr('class', 'pcac-arc')
      .append('path')
      .style('fill', (d: PieArcDatum<PcacData>, i: number) => {
        return this.colors[i];
      })
      .on('mouseover', function (this: any, _: MouseEvent, d: PieArcDatum<PcacData>) {
        const t = transition().duration(self.transitionService.getTransitionDuration() / 3)
        const c = color(self.colors[d.index])
        const ct = c ? c.darker(1).toString() : self.colors[d.index]
        select(this).transition(t)
          .attr('d', self.arcOverShape)
          .style('fill', ct);
      })
      .on('mousemove', (event: MouseEvent, d: PieArcDatum<PcacData>) => {
        self.tooltipBuilder.showBarTooltip(event, d.data);
      })
      .on('mouseout', function (this: any, _: MouseEvent, d: PieArcDatum<PcacData>) {
        self.tooltipBuilder.hideTooltip();
        select(this)
          .transition()
          .duration(self.transitionService.getTransitionDuration() / 3)
          .attr('d', self.arcShape)
          .style('fill', self.colors[d.index]);
      })
      .on('click', (d: PieArcDatum<PcacData>, i: number) => {
        this.sliceClickedSource.next(d.data);
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attrTween('d', (b: PieArcDatum<PcacData>) => {
        return this.tweenChart(b);
      });
  }

  private tweenChart(b: any) {  // TODO: Strongly type
    b.innerRadius = 0;
    const i = interpolate({ startAngle: 0, endAngle: 0 }, b);
    return (t: any) => this.arcShape(i(t));  // TODO: Strongly type
  }
}
