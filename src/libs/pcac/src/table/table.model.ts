import { IPcacChartConfig } from '../core';
import { IHeaderConfig } from '../header';

export interface ITableConfig extends IPcacChartConfig {
  headerConfig: IHeaderConfig;
}
