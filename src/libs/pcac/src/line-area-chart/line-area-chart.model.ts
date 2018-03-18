import { IPcacChartConfig } from '../core';
import { IHeaderConfig } from '../header';

export interface ILineAreaChartConfig extends IPcacChartConfig  {
  headerConfig: IHeaderConfig;
  domainMax: number;
  isArea: boolean;
}
