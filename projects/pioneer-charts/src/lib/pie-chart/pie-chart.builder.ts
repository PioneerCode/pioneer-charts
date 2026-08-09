import { Injectable, ElementRef } from '@angular/core';

/**
 * D3
 */
import { arc, pie, Arc, Pie, PieArcDatum } from 'd3-shape';
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


/**
 * Provided per-component (see PcacPieChartComponent's `providers`), not root-scoped:
 * this builder extends PcacChart, which holds mutable per-chart-instance state (margin, width,
 * height, colors, svg). A root singleton would be shared and clobbered by every
 * <pcac-pie-chart> rendered at once.
 */
@Injectable()
export class PieChartBuilder extends PcacChart {
  private radius!: number;
  private arcShape!: Arc<any, PieArcDatum<PcacData>>;
  private arcOverShape!: Arc<any, PieArcDatum<PcacData>>;
  private pieAngles!: Pie<any, PcacData>;
  private sliceClickedSource = new Subject<PcacData>();
  sliceClicked$ = this.sliceClickedSource.asObservable();

  buildChart(chartElm: ElementRef, config: PcacPieChartConfig): void {
    if (!config?.data?.length) {
      return;
    }

    if (!this.initializeChartState(chartElm, config)) {
      return;
    }
    this.radius = Math.min(Math.min(this.height, this.width), Math.min(this.height, this.width)) / 2;
    this.buildShapes(config);
    this.drawChart(chartElm, config);
  }

  private buildShapes(config: PcacPieChartConfig): void {
    const radiusOffset = 10;

    this.arcShape = arc<any, PieArcDatum<PcacData>>()
      .innerRadius(0)
      .outerRadius(this.radius - radiusOffset);

    this.arcOverShape = arc<any, PieArcDatum<PcacData>>()
      .innerRadius(0)
      .outerRadius(this.radius - radiusOffset + radiusOffset);

    this.pieAngles = pie<PcacData>()
      .sort(null)
      .value((d: PcacData) => d.value as number);
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
      .on('mouseover', function (this: SVGPathElement, _: MouseEvent, d: PieArcDatum<PcacData>) {
        const t = transition().duration(self.transitionService.getTransitionDuration() / 3)
        const c = color(self.colors[d.index])
        const ct = c ? c.darker(1).toString() : self.colors[d.index]
        select<SVGPathElement, PieArcDatum<PcacData>>(this).transition(t)
          .attr('d', self.arcOverShape)
          .style('fill', ct);
      })
      .on('mousemove', (event: MouseEvent, d: PieArcDatum<PcacData>) => {
        self.tooltipBuilder.showBarTooltip(event, d.data);
      })
      .on('mouseout', function (this: SVGPathElement, _: MouseEvent, d: PieArcDatum<PcacData>) {
        self.tooltipBuilder.hideTooltip();
        select<SVGPathElement, PieArcDatum<PcacData>>(this)
          .transition()
          .duration(self.transitionService.getTransitionDuration() / 3)
          .attr('d', self.arcShape)
          .style('fill', self.colors[d.index]);
      })
      .on('click', (_event: MouseEvent, d: PieArcDatum<PcacData>) => {
        this.sliceClickedSource.next(d.data);
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attrTween('d', (b: PieArcDatum<PcacData>) => {
        return this.tweenChart(b);
      });
  }

  private tweenChart(b: PieArcDatum<PcacData>) {
    // `innerRadius`/`outerRadius` aren't part of PieArcDatum - arcShape's own .innerRadius()/.outerRadius()
    // accessors are fixed constants and never read them from the datum, so this is a legacy no-op kept for parity.
    (b as unknown as { innerRadius: number }).innerRadius = 0;
    const i = interpolate({ startAngle: 0, endAngle: 0 }, b);
    return (t: number) => this.arcShape(i(t)) ?? '';
  }
}
