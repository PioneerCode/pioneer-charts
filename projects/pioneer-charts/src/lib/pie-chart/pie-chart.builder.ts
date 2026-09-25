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
import { PcacPieChartConfig, PcacPieDonutConfig } from './pie-chart.model';
import { PcacChart } from '../core/chart';
import { PcacData } from '../core/chart.model';

import { Subject } from 'rxjs';


/** The largest `PcacPieDonutConfig.innerRadius` honored, so a ring is always left to draw. */
const MAX_DONUT_INNER_RADIUS = 0.9;

/**
 * Provided per-component (see PcacPieChartComponent's `providers`), not root-scoped:
 * this builder extends PcacChart, which holds mutable per-chart-instance state (margin, width,
 * height, colors, svg). A root singleton would be shared and clobbered by every
 * <pcac-pie-chart> rendered at once.
 */
@Injectable()
export class PieChartBuilder extends PcacChart {
  private radius!: number;
  private innerRadius = 0;
  private arcShape!: Arc<any, PieArcDatum<PcacData>>;
  private arcOverShape!: Arc<any, PieArcDatum<PcacData>>;
  private pieAngles!: Pie<any, PcacData>;
  private sliceClickedSource = new Subject<PcacData>();
  sliceClicked$ = this.sliceClickedSource.asObservable();

  buildChart(chartElm: ElementRef, config: PcacPieChartConfig): void {
    if (!config?.data?.length) {
      return;
    }

    // The pie deliberately opts out of `heightFull`: `height` here feeds the radius rather than a
    // drawing area, so growing into a tall container would silently change the size of the pie
    // itself. `PcacPieChartConfig` inherits the property from PcacChartConfig, so it's neutralized
    // here rather than being absent from the type. (`<pcac-pie-chart>` also never gets the
    // `pcac-height-full` class the other charts use to stretch their host.)
    if (!this.initializeChartState(chartElm, { ...config, heightFull: false })) {
      return;
    }
    this.radius = Math.min(Math.min(this.height, this.width), Math.min(this.height, this.width)) / 2;
    this.buildShapes(config.donut);
    this.drawChart(chartElm, config);
    if (config.donut && this.innerRadius > 0) {
      this.drawCenter(config.donut);
    }
  }

  private buildShapes(donut: Partial<PcacPieDonutConfig> | undefined): void {
    const radiusOffset = 10;
    const outerRadius = this.radius - radiusOffset;
    const ratio = donut ? (donut.innerRadius ?? new PcacPieDonutConfig().innerRadius) : 0;
    // Sized against the resting slice, so the hole stays put when a hovered slice grows outward.
    this.innerRadius = Math.max(0, outerRadius * Math.min(Math.max(ratio, 0), MAX_DONUT_INNER_RADIUS));

    this.arcShape = arc<any, PieArcDatum<PcacData>>()
      .innerRadius(this.innerRadius)
      .outerRadius(outerRadius);

    this.arcOverShape = arc<any, PieArcDatum<PcacData>>()
      .innerRadius(this.innerRadius)
      .outerRadius(outerRadius + radiusOffset);

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
        self.showTooltip(event, d.data, { index: d.index });
      })
      .on('mouseout', function (this: SVGPathElement, _: MouseEvent, d: PieArcDatum<PcacData>) {
        self.hideTooltip();
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

  /**
   * The donut's `label` / `subLabel`, stacked around the center of the hole and sized to it. Drawn
   * after the slices and ignoring the pointer, so it never blocks a slice's hover or click.
   */
  private drawCenter(donut: Partial<PcacPieDonutConfig>): void {
    const { label, subLabel } = donut;
    if (!label && !subLabel) {
      return;
    }
    const labelSize = Math.min(Math.max(this.innerRadius * 0.5, 12), 40);
    const subLabelSize = Math.min(Math.max(this.innerRadius * 0.2, 10), 16);
    const both = !!label && !!subLabel;

    const center = this.svg.append('g')
      .attr('class', 'pcac-pie-center')
      .attr('pointer-events', 'none')
      .style('--pcac-pie-center-label-color', () => donut.labelColor ?? null)
      .style('--pcac-pie-center-sub-label-color', () => donut.subLabelColor ?? null);

    if (label) {
      center.append('text')
        .attr('class', 'pcac-pie-center-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('y', both ? -subLabelSize * 0.6 : 0)
        .style('font-size', `${labelSize}px`)
        .text(label);
    }
    if (subLabel) {
      center.append('text')
        .attr('class', 'pcac-pie-center-sub-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('y', both ? labelSize * 0.55 : 0)
        .style('font-size', `${subLabelSize}px`)
        .text(subLabel);
    }
  }

  private tweenChart(b: PieArcDatum<PcacData>) {
    const i = interpolate({ startAngle: 0, endAngle: 0 }, b);
    return (t: number) => this.arcShape(i(t)) ?? '';
  }
}
