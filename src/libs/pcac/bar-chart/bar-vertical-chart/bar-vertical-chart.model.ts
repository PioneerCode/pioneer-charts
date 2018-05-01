import { IPcacChartConfig, IPcacData } from '../../core/chart.model';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isGroup: boolean;
  thresholds: IPcacData[];
}
