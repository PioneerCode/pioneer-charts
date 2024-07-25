import { IPcacChartConfig, IPcacData, PcacFormatEnum } from '../../core/chart.model';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isStacked: boolean;
  thresholds: IPcacData[];
  tickFormat?: PcacFormatEnum;
  hideGrid?: boolean;
  hideAxis?: boolean;
  spreadColorsPerGroup?: boolean;
  colorOverride?: IPcacBarVerticalChartColorOverrideConfig;
}

export interface IPcacBarVerticalChartColorOverrideConfig {
  colors: string[];
}
