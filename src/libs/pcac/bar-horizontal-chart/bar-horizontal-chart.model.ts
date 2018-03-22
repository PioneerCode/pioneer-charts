import { IHeaderConfig } from '../header';
import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacBarHorizontalChartConfig extends IPcacChartConfig {
  headerConfig: IHeaderConfig;
  domainMax: number;
}
