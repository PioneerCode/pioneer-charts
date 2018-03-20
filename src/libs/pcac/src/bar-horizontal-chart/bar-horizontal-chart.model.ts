import { IPcacChartConfig } from '../core';
import { IHeaderConfig } from '../header';

export interface IPcacBarHorizontalChartConfig extends IPcacChartConfig {
  headerConfig: IHeaderConfig;
  domainMax: number;
}
