import { IPcacChartConfig, PcacTickFormatEnum } from '../core/chart.model';

export interface IPcacLineAreaChartConfig extends IPcacChartConfig  {

  isArea: boolean
  enableEffects: boolean
  numberOfTicks: number
  hideGrid: boolean
  hideAxis: boolean
  yTickFormat: PcacTickFormatEnum
  xDomainFormat: PcacTickFormatEnum
  yDomainMax: number | string
  yDomainMin: number | string
  xDomainMin: number | string
  xDomainMax: number | string
}
