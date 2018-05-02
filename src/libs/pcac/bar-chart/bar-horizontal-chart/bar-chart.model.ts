import { IPcacChartConfig, IPcacData } from '../../core/chart.model';

export interface IPcacBarChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isStacked: boolean;
  thresholds: IPcacData[];
}
