import { Injectable } from '@angular/core';
import { axisBottom, axisLeft, AxisScale, AxisDomain } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
import { PCAC_AXIS_LABEL_SPACE, PcacChartMargin, PcacResolvedAxisConfig } from './chart.model';
import { axisTickFormat } from './tick-format';

/**
 * Generic over each axis's own domain type (e.g. `number` for a value axis's `ScaleLinear`,
 * `string` for a category axis's `ScaleBand`) rather than `any`, since the two axes on a chart
 * routinely have different domain types and each real D3 scale already satisfies `AxisScale`
 * structurally - no widening needed at the type level.
 */
export interface IPcacAxisBuilderConfig<XDomain extends AxisDomain = AxisDomain, YDomain extends AxisDomain = AxisDomain> {
  svg: Selection<SVGGElement, unknown, BaseType, unknown>;
  /** Plot area size - the axes' own lengths - and the chart's margins, which position a `label`. */
  width: number;
  height: number;
  margin: PcacChartMargin;
  xScale: AxisScale<XDomain>;
  yScale: AxisScale<YDomain>;
  /**
   * The chart's per-axis settings, defaults already applied (`resolveAxisConfig()`). `hide` skips
   * the axis entirely. `tickSize` is D3's `tickSizeInner`; left undefined, D3's default of 6
   * applies to the geometry - but the theme hides tick marks unless the axis group carries
   * `pcac-axis-tick-marks`, which is added exactly when a size is given, so an undefined size
   * means "no visible marks, labels where they've always been". `0` is a legitimate value (no
   * marks, labels hugging the axis), hence the `!== undefined` checks below. `showLine` adds
   * `pcac-axis-line`, which un-hides D3's `.domain` path the same way. The domain path keeps
   * D3's default 6px outer end-caps (`tickSizeOuter`), so it reads as a bracket rather than a
   * bare rule; that's D3's standard look and is left as-is. `label` and `subLabels` are drawn
   * inside the axis group (so they're raised and non-interactive along with it) - see `drawLabels`.
   * `format` picks the tick label format; `None` leaves D3's default. The `*Color` fields are
   * applied by `applyColors`.
   */
  xAxis: PcacResolvedAxisConfig;
  yAxis: PcacResolvedAxisConfig;
}

@Injectable({
  providedIn: 'root',
})
export class PcacAxisBuilder {
  drawAxis<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacAxisBuilderConfig<XDomain, YDomain>): void {
    this.drawXAxis(config);
    this.drawYAxis(config);
  }

  /**
   * Moves both axis groups to the end of the chart's `<g>`, so they paint over everything drawn
   * since `drawAxis()`. Axes are drawn first (so scales and margins are settled before content),
   * which leaves anything sitting at x = 0 - a line chart's first segment and dot, an area's fill,
   * a horizontal bar chart's bars - painting over the y axis line. Builders call this after the
   * content that should sit *under* the axes, and draw anything that should stay on top (the
   * line/area/plot charts' dots) afterwards. Safe to sit above the hover/zoom overlay rects too,
   * because the groups are `pointer-events: none` (set where each group is appended).
   */
  raiseAxes(svg: Selection<SVGGElement, unknown, BaseType, unknown>): void {
    svg.selectAll('.pcac-x-axis, .pcac-y-axis').raise();
  }

  drawYAxis<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacAxisBuilderConfig<XDomain, YDomain>) {
    if (config.yAxis.hide) return;
    config.svg.selectAll('.pcac-y-axis').remove();

    const yAxis = axisLeft(config.yScale).ticks(config.yAxis.ticks);
    if (config.yAxis.tickSize !== undefined) {
      yAxis.tickSizeInner(config.yAxis.tickSize);
    }

    const yFormat = axisTickFormat(config.yAxis.format, config.yScale, config.yAxis.ticks);
    if (yFormat) {
      yAxis.tickFormat(yFormat);
    }


    const group = config.svg.append('g')
      .attr('class', 'pcac-y-axis')
      // Axes are raised above the interactive overlays (see raiseAxes) and take no mouse events
      .attr('pointer-events', 'none')
      .classed('pcac-axis-tick-marks', config.yAxis.tickSize !== undefined)
      .classed('pcac-axis-line', config.yAxis.showLine)
      .call(yAxis)
      .call(applyColors, config.yAxis);

    this.drawLabels(group, config.yAxis, { length: config.height, outer: config.margin.left, vertical: true });
  }

  drawXAxis<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacAxisBuilderConfig<XDomain, YDomain>) {
    if (config.xAxis.hide) return;
    config.svg.selectAll('.pcac-x-axis').remove();

    const xAxis = axisBottom(config.xScale).ticks(config.xAxis.ticks);
    if (config.xAxis.tickSize !== undefined) {
      xAxis.tickSizeInner(config.xAxis.tickSize);
    }

    const xFormat = axisTickFormat(config.xAxis.format, config.xScale, config.xAxis.ticks);
    if (xFormat) {
      xAxis.tickFormat(xFormat);
    }


    const group = config.svg.append('g')
      .attr('class', 'pcac-x-axis')
      .attr('pointer-events', 'none')
      .classed('pcac-axis-tick-marks', config.xAxis.tickSize !== undefined)
      .classed('pcac-axis-line', config.xAxis.showLine)
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(xAxis)
      .call(applyColors, config.xAxis);

    this.drawLabels(group, config.xAxis, { length: config.width, outer: config.margin.bottom, vertical: false });
  }

  /**
   * The axis `label` and `subLabels`. Both are placed by two distances: along the axis (0 at its
   * start, `length` at its end - for the y axis, 0 is the bottom) and out from it, toward the
   * chart's edge. The label goes at the very edge (`outer`, i.e. the margin), the sub-label row
   * `PCAC_AXIS_LABEL_SPACE` inside that when there's a label. For the y axis the text is rotated
   * to read bottom-to-top, which swaps the two: after `rotate(-90)` x runs up the axis (so the
   * bottom is x = -length) and y runs left. `fill` is set explicitly because d3-axis puts
   * `fill="none"` on the group; its own tick text does the same.
   */
  private drawLabels(
    group: Selection<SVGGElement, unknown, BaseType, unknown>,
    axis: PcacResolvedAxisConfig,
    layout: { length: number; outer: number; vertical: boolean }
  ): void {
    const text = (cls: string, along: number, out: number, anchor: string, content: string) => {
      group.append('text')
        .attr('class', cls)
        .attr('fill', 'currentColor')
        .attr('text-anchor', anchor)
        .attr('transform', layout.vertical ? 'rotate(-90)' : null)
        .attr('x', layout.vertical ? along - layout.length : along)
        .attr('y', layout.vertical ? -out : out)
        .attr('dy', layout.vertical ? '1em' : '-0.35em')
        .text(content);
    };

    if (axis.label) {
      text('pcac-axis-label', layout.length / 2, layout.outer, 'middle', axis.label);
    }
    const sub = axis.subLabels;
    if (sub) {
      const edge = layout.outer - (axis.label ? PCAC_AXIS_LABEL_SPACE : 0);
      if (sub.min) text('pcac-axis-sub-label', 0, edge, 'start', sub.min);
      if (sub.mid) text('pcac-axis-sub-label', layout.length / 2, edge, 'middle', sub.mid);
      if (sub.max) text('pcac-axis-sub-label', layout.length, edge, 'end', sub.max);
    }
  }
}

/**
 * Sets the axis's `*Color` fields on its group as CSS custom properties, which the theme reads
 * with its own color as the fallback (`var(--pcac-axis-tick-color, ...)`). Custom properties
 * rather than inline `stroke`/`fill` on the elements: the theme still decides what is drawn (a
 * color never un-hides marks or the line), the property reaches everything d3-axis draws in the
 * group, and a stylesheet can set the same property on any ancestor. An unset field sets nothing.
 */
function applyColors(group: Selection<SVGGElement, unknown, BaseType, unknown>, axis: PcacResolvedAxisConfig): void {
  group
    .style('--pcac-axis-tick-color', () => axis.tickColor ?? null)
    .style('--pcac-axis-tick-label-color', () => axis.tickLabelColor ?? null)
    .style('--pcac-axis-line-color', () => axis.lineColor ?? null)
    .style('--pcac-axis-label-color', () => axis.labelColor ?? null)
    .style('--pcac-axis-sub-label-color', () => axis.subLabelColor ?? null);
}
