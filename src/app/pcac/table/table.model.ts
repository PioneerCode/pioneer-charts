import { IChart } from '../chart.model';
import { IHeaderConfig } from '../header/header.model';

export interface ITableConfig extends IChart {
  headerConfig: IHeaderConfig;
}
