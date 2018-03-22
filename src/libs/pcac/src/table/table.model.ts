import { IPcacChartConfig } from '../core';
import { IHeaderConfig } from '../header';

export interface IPcacTableConfig extends IPcacChartConfig {
  headerConfig: IHeaderConfig;
}
