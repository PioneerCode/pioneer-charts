import { IPcacChartConfig, IPcacData, PcacFormatEnum } from '../../core/chart.model';

export interface IPcacBarHorizontalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isStacked: boolean;
  thresholds: IPcacData[];
  tickFormat?: PcacFormatEnum;
  hideGrid?: boolean;
  hideAxis?: boolean;
  spreadColorsPerGroup?: boolean;
  colorOverride?: IPcacBarHorizontalChartColorOverrideConfig;
}

export interface IPcacBarHorizontalChartColorOverrideConfig {
  colors: string[];
}
