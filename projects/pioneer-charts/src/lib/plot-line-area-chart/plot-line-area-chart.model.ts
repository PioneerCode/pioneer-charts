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
   * only one enabled the other axis simply stays put. Both off by default.
   */
  enableZoomX: boolean = false
  enableZoomY: boolean = false

  /**
   * Hex color codes to override the default colors, one per series in order. Repeats from the
   * start when there are more series than colors, as the default palette does.
   */
  colorOverride: string[] = []

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
}
