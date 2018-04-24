import { IPcacChartConfig } from '../../core/chart.model';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
}
