import { IPcacChartConfig, IPcacData } from '../../core/chart.model';
import { PcacAxisFormatEnum } from '../../core/axis.builder';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isStacked: boolean;
  thresholds: IPcacData[];
  tickFormat?: PcacAxisFormatEnum;
}
