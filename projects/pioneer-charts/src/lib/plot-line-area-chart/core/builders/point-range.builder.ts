import { BaseType, Selection } from 'd3-selection';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';
import { PcacPointRangeStyle } from '../../plot-line-area-chart.model';
import { PlaChartScales } from './scales.builder';

/**
 * A point's `range` in pixels, alongside the point's own position. `x0 < x1` and `y0 < y1` (so
 * `y0` is the range's *max* - the y scale runs top-down); an axis without a usable range has
 * neither of its pair.
 */
export interface PlaRangeExtent {
  cx: number;
  cy: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

/** Half the length of a whisker's end cap, in px. */
export const RANGE_CAP = 5;
/** How thick a box is drawn along an axis the point has no range on, in px. */
export const RANGE_STRIP = 4;
/** How thick a fade is drawn along an axis the point has no range on, in px. */
export const RANGE_FADE_BAR = 10;

/**
 * Where an x range bound lands, read the way `getXFormat` reads a key: a date for `DateTime`, a
 * number for `Decimal`, and a (possibly fractional) index for every index-based format. `NaN`
 * for anything that doesn't parse.
 */
function xBound(value: number | string, format: PcacFormatEnum, scales: PlaChartScales): number {
  if (value === null || value === undefined || value === '') {
    return NaN;
  }
  if (format === PcacFormatEnum.DateTime) {
    return scales.x(new Date(value)) as number;
  }
  return scales.x(Number(value)) as number;
}

/**
 * Sorts a pair of pixel bounds, or returns nothing if either isn't a real number - or if they're
 * the same, since a range that doesn't span anything has nothing to draw (whiskers would be a
 * stray pair of caps, a box or fade zero-sized).
 */
function span(a: number, b: number): [number, number] | undefined {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) {
    return undefined;
  }
  return a <= b ? [a, b] : [b, a];
}

/**
 * `d`'s range at these scales, drawn around `(cx, cy)` - the point's true coordinate - or `null`
 * when it has no range on either axis that can be placed.
 */
export function rangeExtent(
  d: PcacData, cx: number, cy: number, format: PcacFormatEnum, scales: PlaChartScales
): PlaRangeExtent | null {
  const range = d.range;
  if (!range) {
    return null;
  }
  const xs = range.x ? span(xBound(range.x.min, format, scales), xBound(range.x.max, format, scales)) : undefined;
  const ys = range.y ? span(scales.y(Number(range.y.min)), scales.y(Number(range.y.max))) : undefined;
  if (!xs && !ys) {
    return null;
  }
  const extent: PlaRangeExtent = { cx, cy };
  if (xs) {
    [extent.x0, extent.x1] = xs;
  }
  if (ys) {
    [extent.y0, extent.y1] = ys;
  }
  return extent;
}

/**
 * Where the point sits within its range's box, as 0 - 1 fractions: the fade's brightest spot.
 * An axis without a range has the point in the middle.
 */
export function rangeFocus(extent: PlaRangeExtent): { fx: number; fy: number } {
  const fraction = (v: number, lo?: number, hi?: number) =>
    lo === undefined || hi === undefined || hi === lo ? 0.5 : Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  return { fx: fraction(extent.cx, extent.x0, extent.x1), fy: fraction(extent.cy, extent.y0, extent.y1) };
}

/**
 * (Re)draws one point's range into `group`, in plot coordinates, replacing whatever was there -
 * the same call serves the first draw and every zoom. `gradientId` must be unique in the page;
 * only the fade uses it. Colors, stroke widths and opacity all come from the theme (see
 * plot-line-area-chart.component.scss), so nothing here depends on the series.
 */
export function drawRange(
  group: Selection<SVGGElement, unknown, BaseType, unknown>,
  extent: PlaRangeExtent,
  style: PcacPointRangeStyle,
  gradientId: string
): void {
  group.selectAll('*').remove();
  const { cx, cy, x0, x1, y0, y1 } = extent;

  switch (style) {
    case PcacPointRangeStyle.Box: {
      const left = x0 ?? cx - RANGE_STRIP / 2;
      const right = x1 ?? cx + RANGE_STRIP / 2;
      const top = y0 ?? cy - RANGE_STRIP / 2;
      const bottom = y1 ?? cy + RANGE_STRIP / 2;
      group.append('rect')
        .attr('class', 'point-range-box')
        .attr('x', left)
        .attr('y', top)
        .attr('width', right - left)
        .attr('height', bottom - top)
        .attr('rx', 2);
      return;
    }

    case PcacPointRangeStyle.Fade: {
      const { fx, fy } = rangeFocus(extent);
      const stops = (gradient: Selection<any, unknown, BaseType, unknown>, offsets: [number, number][]) => {
        for (const [offset, opacity] of offsets) {
          gradient.append('stop')
            .attr('class', 'point-range-stop')
            .attr('offset', offset)
            .attr('stop-opacity', opacity);
        }
      };
      // The gradient lives inside the point's own group, not the chart's <defs>, so its stops
      // inherit the color custom properties set on the series group above it. Sized in
      // objectBoundingBox units, so the brightest spot stays on the point as zoom stretches it.
      const defs = group.append('defs');
      if (x0 !== undefined && x1 !== undefined && y0 !== undefined && y1 !== undefined) {
        const gradient = defs.append('radialGradient')
          .attr('id', gradientId)
          .attr('cx', 0.5).attr('cy', 0.5).attr('r', 0.5)
          .attr('fx', fx).attr('fy', fy);
        stops(gradient, [[0, 0.8], [0.5, 0.35], [1, 0]]);
        group.append('ellipse')
          .attr('class', 'point-range-fade')
          .attr('cx', (x0 + x1) / 2)
          .attr('cy', (y0 + y1) / 2)
          .attr('rx', (x1 - x0) / 2)
          .attr('ry', (y1 - y0) / 2)
          .attr('fill', `url(#${gradientId})`);
        return;
      }
      const vertical = y0 !== undefined && y1 !== undefined;
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', vertical ? 0 : 1).attr('y2', vertical ? 1 : 0);
      stops(gradient, [[0, 0.05], [vertical ? fy : fx, 0.8], [1, 0.05]]);
      const left = x0 ?? cx - RANGE_FADE_BAR / 2;
      const right = x1 ?? cx + RANGE_FADE_BAR / 2;
      const top = y0 ?? cy - RANGE_FADE_BAR / 2;
      const bottom = y1 ?? cy + RANGE_FADE_BAR / 2;
      group.append('rect')
        .attr('class', 'point-range-fade')
        .attr('x', left)
        .attr('y', top)
        .attr('width', right - left)
        .attr('height', bottom - top)
        .attr('rx', RANGE_FADE_BAR / 2)
        .attr('fill', `url(#${gradientId})`);
      return;
    }

    default: {
      // Whiskers
      const line = (xa: number, ya: number, xb: number, yb: number, cls: string) =>
        group.append('line')
          .attr('class', cls)
          .attr('x1', xa).attr('y1', ya)
          .attr('x2', xb).attr('y2', yb);
      if (y0 !== undefined && y1 !== undefined) {
        line(cx, y0, cx, y1, 'point-range-whisker');
        line(cx - RANGE_CAP, y0, cx + RANGE_CAP, y0, 'point-range-cap');
        line(cx - RANGE_CAP, y1, cx + RANGE_CAP, y1, 'point-range-cap');
      }
      if (x0 !== undefined && x1 !== undefined) {
        line(x0, cy, x1, cy, 'point-range-whisker');
        line(x0, cy - RANGE_CAP, x0, cy + RANGE_CAP, 'point-range-cap');
        line(x1, cy - RANGE_CAP, x1, cy + RANGE_CAP, 'point-range-cap');
      }
    }
  }
}
