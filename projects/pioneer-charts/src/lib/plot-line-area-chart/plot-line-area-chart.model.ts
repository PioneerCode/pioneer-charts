import { PcacChartConfig, PcacFormatEnum } from '../core/chart.model';

export enum PcacLineAreaPlotChartConfigType {
  Line = 'line',
  Area = 'area',
  Plot = 'plot'
}

export class PcacLineAreaChartConfig extends PcacChartConfig {
  /**
   * Transform type of the chart.
   */
  type: PcacLineAreaPlotChartConfigType = PcacLineAreaPlotChartConfigType.Line
  enableEffects: boolean = true
  numberOfTicks: number = 5
  hideGrid: boolean = false
  hideAxis: boolean = false
  yFormat: PcacFormatEnum = PcacFormatEnum.None
  xFormat: PcacFormatEnum = PcacFormatEnum.None
  yDomainMax!: number | string
  yDomainMin!: number | string
  xDomainMin!: number | string
  xDomainMax!: number | string
}
