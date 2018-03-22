import { IHeaderConfig } from '../header';
import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  headerConfig: IHeaderConfig;
  domainMax: number;
}
