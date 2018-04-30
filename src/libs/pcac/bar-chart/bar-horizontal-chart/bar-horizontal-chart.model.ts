import { IPcacChartConfig } from '../../core/chart.model';

export interface IPcacBarHorizontalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  isGroup: boolean;
}
