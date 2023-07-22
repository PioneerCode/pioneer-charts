import { IPcacChartConfig, PcacFormatEnum } from '../core/chart.model';

export interface IPcacLineAreaChartConfig extends IPcacChartConfig  {

  isArea: boolean
  enableEffects: boolean
  numberOfTicks: number
  hideGrid: boolean
  hideAxis: boolean
  yFormat: PcacFormatEnum
  xFormat: PcacFormatEnum
  yDomainMax: number | string
  yDomainMin: number | string
  xDomainMin: number | string
  xDomainMax: number | string
}
