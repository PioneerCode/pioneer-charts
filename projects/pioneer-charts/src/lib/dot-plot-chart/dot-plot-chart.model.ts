import { PcacAxisChartConfig } from '../core/chart.model';
import { PcacPointImageConfig } from '../plot-line-area-chart/plot-line-area-chart.model';

/**
 * A dot plot: every point placed along one value axis (x), and points that share a value - or,
 * with `binWidth`, fall in the same bin - stacked into a column above it, one mark per point. It
 * shows how values are distributed while keeping every item visible and hoverable, which suits
 * items with their own identity (and their own `image`) better than a histogram's bars.
 *
 * `data` is series, each holding its points - the same shape as the plot chart - so points can be
 * colored by group. A point's `value` is its position on the axis and its `key` its name (in the
 * tooltip and to screen readers). A point whose `value` isn't a number is left out, as is a series
 * or point with `hide`.
 *
 * The axes: `xAxis` is the value axis - `domainMin` / `domainMax` fix its span (by default it
 * spans the data, rounded out to nice ticks), `format` formats its ticks and the tooltip's value,
 * and every label, sub label, tick and grid setting applies. There is no y scale - a column's
 * height is a count of marks, not a value - so the y axis is never drawn; `yAxis` is ignored.
 */
export class PcacDotPlotChartConfig extends PcacAxisChartConfig {
  /**
   * Group values into bins this wide, in the axis's units, and stack each bin at its center: with
   * values 7, 7.5 and 8 and a `binWidth` of 1, the 7 and 7.5 share a column. Unset (the default),
   * only equal values stack. Bins start at `xAxis.domainMin`, or 0 without one.
   */
  binWidth?: number

  /**
   * Radius of a point's dot, in px; default 6. Points with an `image` are sized by `pointImage`
   * instead. Optional, as `colorOverride` is on every chart, so an object literal needn't spell it out.
   */
  dotRadius?: number = 6

  /** Space between marks stacked in a column, in px; default 2. Optional, likewise. */
  gap?: number = 2

  /**
   * Bounding box for points' images (`PcacData.image`), drawn in place of their dots, as on the
   * plot chart. Each field falls back to its `PcacPointImageConfig` default.
   *
   * A column too tall for the chart's height shrinks every mark on the chart evenly until it fits,
   * so no point is ever cut off; give the chart more `height` to keep marks at full size. The
   * chart's `markFit` output reports how far they were shrunk.
   */
  pointImage?: Partial<PcacPointImageConfig>

  /**
   * Series colors, any CSS color, in place of the theme palette, one per series in order. Repeats
   * when there are more series than colors. Omitted or empty, the theme palette is used.
   */
  colorOverride?: string[]
}
