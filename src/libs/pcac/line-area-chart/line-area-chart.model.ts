import { IHeaderConfig } from '../header';
import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacLineAreaChartConfig extends IPcacChartConfig  {
  headerConfig: IHeaderConfig;
  domainMax: number;
  isArea: boolean;
  numberOfTicks: number;
}
