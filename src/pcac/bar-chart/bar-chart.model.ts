import { IHeaderConfig } from '../header/header.model';
import { IChart } from '../chart.model';

export interface IBarChartConfig extends IChart {
  headerConfig: IHeaderConfig;
}
