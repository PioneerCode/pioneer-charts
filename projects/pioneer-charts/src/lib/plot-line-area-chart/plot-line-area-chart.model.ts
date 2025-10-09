import { PcacChartConfig, PcacFormatEnum } from '../core/chart.model';

export enum PcacLineAreaPlotChartConfigType {
  Line = 'line',
  Area = 'area',
  Plot = 'plot'
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
}
