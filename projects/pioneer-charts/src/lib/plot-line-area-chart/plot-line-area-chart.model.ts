import { PcacAxisChartConfig } from '../core/chart.model';

export enum PcacLineAreaPlotChartConfigType {
  Line = 'line',
  Area = 'area',
  Plot = 'plot'
}

/**
 * Sizing for the images drawn in place of a point's dot (see `PcacData.image`). An image is
 * scaled uniformly (up or down) to fit inside a `maxWidth` x `maxHeight` box, preserving its
 * aspect ratio, and is centered on the data point exactly where the dot would have been.
 */
export class PcacPointImageConfig {
  maxWidth: number = 16
  maxHeight: number = 16
}

/** How a point's `range` is drawn (see `PcacPointRangeConfig.style`). */
export enum PcacPointRangeStyle {
  /** Error bars: a line across each range, capped at both ends. */
  Whiskers = 'whiskers',
  /** A rectangle spanning the x range by the y range; a thin strip when only one is set. */
  Box = 'box',
  /**
   * A fill strongest at the point's value and fading out to the range's edges: an oval glow
   * with both ranges (brightest on the value, even off-center), a fading bar with one.
   */
  Fade = 'fade'
}

/** When a point's `range` shows (see `PcacPointRangeConfig.show`). */
export enum PcacPointRangeShow {
  /** Only the hovered point's range. */
  Hover = 'hover',
  /** Every range at `faintOpacity`, the hovered point's at full strength. */
  Faint = 'faint',
  /** Every range at full strength; the others dim while a point is hovered. */
  Always = 'always'
}

/**
 * Drawing for `PcacData.range` on the line/area/plot charts. Ranges sit above the lines/areas and
 * below the points, on the point's true coordinate (a fanned-out point's range stays on its
 * anchor), clipped to the plot area and following zoom. The chart draws no numbers for them; a
 * custom tooltip gets the point, `range` included.
 */
export class PcacPointRangeConfig {
  style: PcacPointRangeStyle = PcacPointRangeStyle.Whiskers
  show: PcacPointRangeShow = PcacPointRangeShow.Faint

  /** Opacity of the ranges at rest under `show: Faint`, 0 - 1. */
  faintOpacity: number = 0.2

  /**
   * Any CSS color for every range on the chart. Unset, each takes its series' color. Applied as
   * `--pcac-point-range-color` on the chart's `.point-ranges` group, so a stylesheet can set it
   * on an ancestor instead (a config value wins).
   */
  color?: string
}

/**
 * Drawing for `PcacData.gauge` on the line/area/plot charts: a ring around each point's mark (its
 * dot, or its image) whose arc fills clockwise from 12 o'clock in proportion to `gauge / max`,
 * over a faint full-circle track. Drawn with the mark, so it moves with zoom and fan-out; fan-out
 * spacing and the chart's edge space grow to fit it. Points without a `gauge` get no ring.
 */
export class PcacPointGaugeConfig {
  /** The `gauge` value of a full ring. Default 1, for values that are already a fraction. */
  max: number = 1

  /** Ring thickness in px. */
  width: number = 2.5

  /** Space between the mark (the image box, or a hovered dot) and the ring, in px. */
  gap: number = 3

  /** Draw the unfilled rest of the ring, so an arc reads as a share of a whole. */
  showTrack: boolean = true

  /**
   * What the gauge measures, e.g. `'PSA'`. When set, each point's screen reader name ends with it
   * and the point's value - "…, PSA 0.018" - since the ring itself is only visual. Unset, the
   * ring isn't read at all; say what it means in the chart's `ariaLabel`, or a custom tooltip.
   */
  name?: string

  /**
   * Any CSS color for the filled arc. Unset, each takes its series' color. Applied as
   * `--pcac-point-gauge-color` on the chart's `.dots` groups, so a stylesheet can set it on an
   * ancestor instead (a config value wins).
   */
  color?: string

  /** Any CSS color for the track (`--pcac-point-gauge-track-color`). Theme default `$gray-200`. */
  trackColor?: string
}

/**
 * A line across the plot at one value on an axis (see `PcacLineAreaChartConfig.referenceLines`):
 * a target, a threshold, a median. Drawn dashed, over the grid and under the series, clipped to
 * the plot area, and moved with zoom like the data.
 */
export class PcacReferenceLine {
  /** Which axis `value` is on: `'y'` draws a horizontal line, `'x'` a vertical one. */
  axis: 'x' | 'y' = 'y'

  /**
   * Where the line sits, in the axis's own terms: a number on the y axis; on the x axis, whatever
   * a point's `key` would be under `xAxis.format` - a number for `Decimal`, a date (or anything
   * `new Date()` reads) for `DateTime`, a series index otherwise.
   */
  value: number | string = 0

  /**
   * A few words drawn at the line's far end, inside the plot: above the right end of a horizontal
   * line, beside the top of a vertical one. Styled by the theme's `.reference-line-label` rule.
   */
  label?: string

  /**
   * Any CSS color for the line and its label. Theme default `$gray-500`. Applied as
   * `--pcac-reference-line-color` on the line's group, so a stylesheet can set it on an ancestor
   * instead (a config value wins).
   */
  color?: string
}

/**
 * Text pinned to the plot area's corners (see `PcacLineAreaChartConfig.cornerLabels`) - names for
 * the regions the plot divides into, such as the quadrants between two reference lines. Pinned to
 * the plot's frame rather than to data, so they stay put when the chart is zoomed. Drawn under the
 * series, so a point in the corner covers its label rather than the other way round. Any corner
 * left unset is left empty.
 */
export class PcacCornerLabels {
  topLeft?: string
  topRight?: string
  bottomLeft?: string
  bottomRight?: string

  /**
   * Any CSS color for all four. Theme default `$gray-600`. Applied as `--pcac-corner-label-color`
   * on their group, so a stylesheet can set it on an ancestor instead (a config value wins).
   */
  color?: string
}

/**
 * The axes' `format` and `domainMin`/`domainMax` (`PcacAxisConfig`) do more here than on the bar
 * charts. `yAxis.domainMin`/`domainMax` are the y scale's domain (default 0..100). `xAxis.format`
 * decides how each point's `key` becomes an x position: `Decimal` reads it as a number on a
 * linear scale from `xAxis.domainMin` to `domainMax`, `DateTime` parses it with `new Date()` on
 * a time scale between the two (both required), and every other format - including the default -
 * places points by their index within their series, sizing the axis from the first series'
 * length and ignoring the domain fields.
 */
export class PcacLineAreaChartConfig extends PcacAxisChartConfig {
  enableEffects: boolean = true
  /**
   * Zoom and pan along the x / y axis (scroll / pinch to zoom 1x-10x, drag to pan, never leaving
   * the original domain). Either, or both, can be on. A gesture is always two-dimensional, so with
   * only one enabled the other axis simply stays put. Both off by default. The zoom is kept when
   * the chart redraws - a new config, a series toggled in a legend, a resize (which keeps the same
   * part of the domain in view) - and dropped when zoom is turned off or the zoomable axes change.
   */
  enableZoomX: boolean = false
  enableZoomY: boolean = false

  /**
   * Series colors, any CSS color, in place of the theme palette, one per series in order. Repeats
   * from the start when there are more series than colors, as the default palette does. Omitted or
   * empty, the theme palette is used - optional, as on every chart's config.
   */
  colorOverride?: string[]

  /**
   * Bounding box for any point images (`PcacData.image`) on this chart. Optional; each field falls
   * back to the `PcacPointImageConfig` default when not given, so a consumer only setting `image`
   * on their data still gets a sensibly-sized result.
   */
  pointImage?: Partial<PcacPointImageConfig>

  /**
   * Draw each point's `range` (see `PcacData.range`). Off when not set; `{}` turns it on with
   * every `PcacPointRangeConfig` default. Points without a `range` draw nothing extra.
   */
  pointRange?: Partial<PcacPointRangeConfig>

  /**
   * Dashed lines at chosen values on either axis (see `PcacReferenceLine`). None when not set.
   * They are decoration for sighted readers - hidden from screen readers like the grid - so when
   * one carries meaning, say so in the chart's `ariaLabel`.
   */
  referenceLines?: Partial<PcacReferenceLine>[]

  /**
   * Draw each point's `gauge` as a ring around its mark (see `PcacData.gauge`). Off when not set;
   * `{}` turns it on with every `PcacPointGaugeConfig` default. Points without a `gauge` draw
   * nothing extra.
   */
  pointGauge?: Partial<PcacPointGaugeConfig>

  /**
   * Labels in the plot's four corners (see `PcacCornerLabels`). None when not set. Hidden from
   * screen readers like the grid, so when they carry meaning, say so in the chart's `ariaLabel`.
   */
  cornerLabels?: PcacCornerLabels
}
