import { IHeaderConfig } from '../header';
import { IChart } from '../chart.model';

export interface IBarChartConfig extends IChart {
  headerConfig: IHeaderConfig;
}
