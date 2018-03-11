import { IHeaderConfig } from '../header/header.model';
import { IData } from '../data.model';

export interface IBarChartConfig {
  headerConfig: IHeaderConfig;
  data: IData[];
}
