import { IPcacChartConfig, PcacTickFormatEnum } from '../core/chart.model';

export interface IPcacLineAreaChartConfig extends IPcacChartConfig  {
  domainMax: number
  domainMin: number
  isArea: boolean
  enableEffects: boolean
  numberOfTicks: number
  hideGrid: boolean
  hideAxis: boolean
  yTickFormat: PcacTickFormatEnum
}
