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
