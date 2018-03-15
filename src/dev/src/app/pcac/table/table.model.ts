import { IChart } from '../chart.model';
import { IHeaderConfig } from '../header';

export interface ITableConfig extends IChart {
  headerConfig: IHeaderConfig;
}
