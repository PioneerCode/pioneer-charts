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
  /**
   * Tick count hint for a continuous scale (D3's `ticks(n)`); a category (band) scale ignores it
   * and gets one line per category.
   */
  numberOfTicks: number;
  /**
   * Line color (`PcacAxisConfig.gridColor`), set on the grid group as `--pcac-grid-color` for the
   * theme's `.pcac-grid-rule line` rule to read; unset means the theme's color. See the axis
   * builder's `applyColors` for why a custom property.
   */
  color?: string;
}

/**
 * `AxisScale` (the shape shared by every D3 scale usable here) doesn't declare `.ticks()` -
 * band scales don't have one - nor `.bandwidth()`, which only band scales have. Either kind can
 * drive a grid: a continuous scale puts a line at each tick, a band scale one through the middle
 * of each category, so `gridLines()` sniffs for `.ticks` and handles both.
 */
type TickableAxisScale<Domain extends AxisDomain> = AxisScale<Domain> & { ticks(count?: number): Domain[] };
type BandAxisScale<Domain extends AxisDomain> = AxisScale<Domain> & { bandwidth(): number };

/** Where along its axis each grid line sits, in pixels. */
function gridLines<Domain extends AxisDomain>(scale: AxisScale<Domain>, numberOfTicks: number): number[] {
  if (typeof (scale as TickableAxisScale<Domain>).ticks === 'function') {
    return (scale as TickableAxisScale<Domain>).ticks(numberOfTicks).map(d => scale(d) ?? 0);
  }
  const band = scale as BandAxisScale<Domain>;
  const half = typeof band.bandwidth === 'function' ? band.bandwidth() / 2 : 0;
  return scale.domain().map(d => (scale(d) ?? 0) + half);
}

@Injectable({
  providedIn: 'root',
})
export class PcacGridBuilder {
  /**
   * Vertical lines, one per x-axis tick (or category), running the plot's full height. The group
   * is classed `pcac-grid-vertical` (the horizontal one `pcac-grid-horizontal`) so a chart can
   * find and redraw just one grid - the line/area/plot charts do on zoom, when an axis's ticks move.
   */
  drawVerticalGrid<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacGridBuilderConfig<XDomain, YDomain>): void {
    config.svg.append('g')
      .attr('class', 'pcac-grid pcac-grid-vertical')
      .style('--pcac-grid-color', () => config.color ?? null)
      .selectAll('g.rule')
      .data(gridLines(config.xScale, config.numberOfTicks))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .attr('transform', (x): string => (`translate(${x}, 0)`))
      .append('svg:line')
      .attr('y1', 0)
      .attr('y2', config.height)
      .attr('class', (d, i: number) => (i === 0 ? 'pcac-grid-rule-last' : ''));
  }

  /**
   * Horizontal lines, one per y-axis tick (or category), running the plot's full width.
   */
  drawHorizontalGrid<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacGridBuilderConfig<XDomain, YDomain>): void {
    config.svg.append('g')
      .attr('class', 'pcac-grid pcac-grid-horizontal')
      .style('--pcac-grid-color', () => config.color ?? null)
      .selectAll('g.pcac-grid-rule')
      .data(gridLines(config.yScale, config.numberOfTicks))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .append('svg:line')
      .attr('y1', (y) => y)
      .attr('y2', (y) => y)
      .attr('x1', 0)
      .attr('x2', config.width)
      .attr('class', (_, i) => (i === 0 ? 'pcac-grid-rule-last' : ''));
  }
}
