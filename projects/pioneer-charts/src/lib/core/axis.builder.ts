import { Injectable } from '@angular/core';
import { axisBottom, axisLeft, AxisScale, AxisDomain } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
import { PcacFormatEnum } from './chart.model';
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
  numberOfTicks: number;
  yFormat?: PcacFormatEnum;
  xFormat?: PcacFormatEnum;
  hideYAxis?: boolean;
  hideXAxis?: boolean;
  /**
   * Length in pixels of each axis's per-tick marks (D3's `tickSizeInner`). Left undefined, D3's
   * default of 6 applies to the geometry - but the theme hides tick marks unless the axis group
   * carries `pcac-axis-tick-marks`, which is added exactly when a size is given here, so an
   * undefined size means "no visible marks, labels where they've always been". `0` is a
   * legitimate value (no tick marks, labels hugging the axis), so callers must check
   * `!== undefined` rather than truthiness. The two outer end-caps of the domain line
   * (`tickSizeOuter`) are deliberately left alone.
   */
  xTickSize?: number;
  yTickSize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PcacAxisBuilder {
  drawAxis<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacAxisBuilderConfig<XDomain, YDomain>): void {
    this.drawXAxis(config);
    this.drawYAxis(config);
  }

  drawYAxis<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacAxisBuilderConfig<XDomain, YDomain>) {
    if (config.hideYAxis) return;

    const yAxis = axisLeft(config.yScale).ticks(config.numberOfTicks);
    if (config.yTickSize !== undefined) {
      yAxis.tickSizeInner(config.yTickSize);
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
      .classed('pcac-axis-tick-marks', config.yTickSize !== undefined)
      .call(yAxis);
  }

  drawXAxis<XDomain extends AxisDomain, YDomain extends AxisDomain>(config: IPcacAxisBuilderConfig<XDomain, YDomain>) {
    if (config.hideXAxis) return;
    config.svg.selectAll('.pcac-x-axis').remove();

    const xAxis = axisBottom(config.xScale).ticks(config.numberOfTicks);
    if (config.xTickSize !== undefined) {
      xAxis.tickSizeInner(config.xTickSize);
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
      .classed('pcac-axis-tick-marks', config.xTickSize !== undefined)
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(xAxis);
  }
}
