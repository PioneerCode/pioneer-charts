import { Injectable } from '@angular/core';
import { BaseType, Selection } from 'd3-selection';
import { AxisScale, AxisDomain } from 'd3-axis';

/**
 * Generic over each axis's own domain type, same rationale as `IPcacAxisBuilderConfig`.
 */
export interface IPcacGridBuilderConfig<XDomain extends AxisDomain = AxisDomain, YDomain extends AxisDomain = AxisDomain> {
  svg: Selection<SVGGElement, unknown, BaseType, unknown>;
  /**
   * Required for horizontal grid
   */
  width: number;
  /**
   * Required for vertical grid
   */
  height: number;
  xScale: AxisScale<XDomain>;
  yScale: AxisScale<YDomain>;
  numberOfTicks: number;
}

/**
 * `AxisScale` (the shape shared by every D3 scale usable here) doesn't declare `.ticks()` -
 * band scales don't have one. The grid, unlike the axis builder, always calls `.ticks()`
 * directly on whichever scale is driving its grid lines, so we assert that narrower shape
 * locally at the one call site that needs it rather than widening the whole config type -
 * by convention the scale actually driving grid lines is always a continuous one.
 */
type TickableAxisScale<Domain extends AxisDomain> = AxisScale<Domain> & { ticks(count?: number): Domain[] };

@Injectable({
  providedIn: 'root',
})
export class PcacGridBuilder {
  drawVerticalGrid<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacGridBuilderConfig<XDomain, YDomain>): void {
    const xScale = config.xScale as TickableAxisScale<XDomain>;
    config.svg.append('g')
      .attr('class', 'pcac-grid')
      .selectAll('g.rule')
      .data(xScale.ticks(5))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .attr('transform', (d): string => (`translate(${xScale(d)}, 0)`))
      .append('svg:line')
      .attr('y1', 0)
      .attr('y2', config.height)
      .attr('class', (d, i: number) => (i === 0 ? 'pcac-grid-rule-last' : ''));
  }

  drawHorizontalGrid<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacGridBuilderConfig<XDomain, YDomain>): void {
    const yScale = config.yScale as TickableAxisScale<YDomain>;
    config.svg.append('g')
      .attr('class', 'pcac-grid')
      .selectAll('g.pcac-grid-rule')
      .data(yScale.ticks(config.numberOfTicks))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .append('svg:line')
      .attr('y1', (d) => yScale(d) ?? null)
      .attr('y2', (d) => yScale(d) ?? null)
      .attr('x1', 0)
      .attr('x2', config.width)
      .attr('class', (_, i) => (i === 0 ? 'pcac-grid-rule-last' : ''));
  }
}
