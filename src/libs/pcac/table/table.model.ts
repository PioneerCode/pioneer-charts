import { IHeaderConfig } from '../header';
import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacTableConfig extends IPcacChartConfig {
  headerConfig: IHeaderConfig;
}
