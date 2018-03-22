import { IPcacChartConfig } from '../core';
import { IHeaderConfig } from '../header';

export interface IPcacLineAreaChartConfig extends IPcacChartConfig  {
  headerConfig: IHeaderConfig;
  domainMax: number;
  isArea: boolean;
}
