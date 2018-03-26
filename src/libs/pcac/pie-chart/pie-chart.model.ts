import { IHeaderConfig } from '../header';
import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacPieChartConfig extends IPcacChartConfig  {
  headerConfig: IHeaderConfig;
}
