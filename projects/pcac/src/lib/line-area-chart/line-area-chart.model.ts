import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacLineAreaChartConfig extends IPcacChartConfig  {
  domainMax: number;
  isArea: boolean;
  enableEffects: boolean;
  numberOfTicks: number;
}
