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
  enableZoom: boolean = true

  /**
   * Hex color codes to override the default colors
   */
  colorOverride: string[] = []

  /**
   * Bounding box for any point images (`PcacData.image`) on this chart. Optional; each field falls
   * back to the `PcacPointImageConfig` default when not given, so a consumer only setting `image`
   * on their data still gets a sensibly-sized result.
   */
  pointImage?: Partial<PcacPointImageConfig>
}
