import { Injectable } from '@angular/core';
import { axisBottom, axisLeft, AxisScale, AxisDomain } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
import { PcacFormatEnum, PcacResolvedAxisConfig } from './chart.model';
import { format } from 'd3-format';

/**
 * Generic over each axis's own domain type (e.g. `number` for a value axis's `ScaleLinear`,
 * `string` for a category axis's `ScaleBand`) rather than `any`, since the two axes on a chart
 * routinely have different domain types and each real D3 scale already satisfies `AxisScale`
 * structurally - no widening needed at the type level.
 */
export interface IPcacAxisBuilderConfig<XDomain extends AxisDomain = AxisDomain, YDomain extends AxisDomain = AxisDomain> {
  svg: Selection<SVGGElement, unknown, BaseType, unknown>;
  height: number;
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
   * bare rule; that's D3's standard look and is left as-is.
   */
  xAxis: PcacResolvedAxisConfig;
  yAxis: PcacResolvedAxisConfig;
  yFormat?: PcacFormatEnum;
  xFormat?: PcacFormatEnum;
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

    const yAxis = axisLeft(config.yScale).ticks(config.yAxis.ticks);
    if (config.yAxis.tickSize !== undefined) {
      yAxis.tickSizeInner(config.yAxis.tickSize);
    }

    if (config.yFormat) {
      switch (config.yFormat) {
        case PcacFormatEnum.Percentage:
          yAxis.tickFormat(d => d + "%");
          break;
        case PcacFormatEnum.Minutes:
          yAxis.tickFormat((d) => d + 'm');
          break;
        case PcacFormatEnum.Fahrenheit:
          yAxis.tickFormat((d) => d + ' F');
          break;
      }
    }

    config.svg.append('g')
      .attr('class', 'pcac-y-axis')
      // Axes are raised above the interactive overlays (see raiseAxes) and take no mouse events
      .attr('pointer-events', 'none')
      .classed('pcac-axis-tick-marks', config.yAxis.tickSize !== undefined)
      .classed('pcac-axis-line', config.yAxis.showLine)
      .call(yAxis);
  }

  drawXAxis<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacAxisBuilderConfig<XDomain, YDomain>) {
    if (config.xAxis.hide) return;
    config.svg.selectAll('.pcac-x-axis').remove();

    const xAxis = axisBottom(config.xScale).ticks(config.xAxis.ticks);
    if (config.xAxis.tickSize !== undefined) {
      xAxis.tickSizeInner(config.xAxis.tickSize);
    }

    if (config.xFormat) {
      switch (config.xFormat) {
        case PcacFormatEnum.Percentage:
          xAxis.tickFormat(d => d + "%");
          break;
        case PcacFormatEnum.Minutes:
          xAxis.tickFormat((d) => d + 'm');
          break;
        case PcacFormatEnum.Fahrenheit:
          xAxis.tickFormat((d) => d + ' F');
          break;
        case PcacFormatEnum.OneDayHours:
          xAxis.tickFormat((d) => {
            const h = d as number;
            const hour = h % 12 === 0 ? 12 : h % 12;
            const period = h < 12 ? 'am' : 'pm';
            return `${hour}${period}`;
          });
          break;
        case PcacFormatEnum.Decimal:
          xAxis.tickFormat((d) => format(".2s")(d as number));
          break;
      }
    }

    config.svg.append('g')
      .attr('class', 'pcac-x-axis')
      .attr('pointer-events', 'none')
      .classed('pcac-axis-tick-marks', config.xAxis.tickSize !== undefined)
      .classed('pcac-axis-line', config.xAxis.showLine)
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(xAxis);
  }
}
