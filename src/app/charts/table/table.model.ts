import { IData } from '../data.model';
import { IHeaderConfig } from '../../shared/header/header.model';

export interface ITableConfig {
  headerConfig: IHeaderConfig;
  data: IData[];
  labels: ITableLabel[];
}

export interface ITableLabel {
  text: string;
}
