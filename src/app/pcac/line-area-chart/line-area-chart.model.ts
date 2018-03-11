import { IHeaderConfig } from '../header/header.model';
import { IData } from '../data.model';

export interface ILineAreaChartConfig {
  headerConfig: IHeaderConfig;
  data: IData[];
}
