import { IPcacChartConfig } from '../core';
import { IHeaderConfig } from '../header';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  headerConfig: IHeaderConfig;
  domainMax: number;
}
