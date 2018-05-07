import { IPcacChartConfig, IPcacData, PcacTickFormatEnum } from '../../core/chart.model';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isStacked: boolean;
  thresholds: IPcacData[];
  tickFormat?: PcacTickFormatEnum;
}
