import { PcacChartConfig, PcacFormatEnum } from '../core/chart.model';

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

export class PcacLineAreaChartConfig extends PcacChartConfig {
  enableEffects: boolean = true
  enableZoom: boolean = true
  numberOfTicks: number = 5
  hideGrid: boolean = false
  hideAxis: boolean = false

  /**
   * Length in pixels of the small tick marks along the x / y axis. Tick marks are not drawn at
   * all unless one of these is set (the theme hides them, as it always has), so setting a size is
   * also what turns them on for that axis; D3's default 6px is a sensible first value. `0` keeps
   * them off but still pulls the labels in to the axis. Tick labels follow the marks (D3 places
   * them at tick length + 3px), and the chart's margins grow or shrink by the same amount so the
   * plot area makes room for them - a longer tick means a slightly smaller plot, never labels
   * pushed off the edge. Only the per-tick marks change - the axis line's two end-caps keep their
   * default length. Color comes from the theme (`.pcac-axis-tick-marks .tick line`).
   *
   * Optional (rather than defaulted) for the same reason as `PcacChartConfig.heightFull`: so
   * existing object-literal / JSON configs don't have to declare them.
   */
  xTickSize?: number
  yTickSize?: number
  yFormat: PcacFormatEnum = PcacFormatEnum.DatasetLength
  xFormat: PcacFormatEnum = PcacFormatEnum.DatasetLength
  yDomainMax!: number | string
  yDomainMin!: number | string
  xDomainMin!: number | string
  xDomainMax!: number | string

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
