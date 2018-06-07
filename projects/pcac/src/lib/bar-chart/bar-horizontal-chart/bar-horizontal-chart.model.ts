import { IPcacChartConfig, IPcacData, PcacTickFormatEnum } from '../../core/chart.model';

export interface IPcacBarHorizontalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isStacked: boolean;
  thresholds: IPcacData[];
  tickFormat?: PcacTickFormatEnum;
  hideGrid?: boolean;
  hideAxis?: boolean;
  colorOverride?: IPcacBarHorizontalChartColorOverrideConfig;
}

export interface IPcacBarHorizontalChartColorOverrideConfig {
  color: string[];
}
