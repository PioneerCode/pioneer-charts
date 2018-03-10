import { IData } from '../data.model';

export interface ITableConfig {
  data: IData[];
  labels: ITableLabel[];
}

export interface ITableLabel {
  text: string;
}
