export interface IChart {
  data: IData[];
}

export interface IData {
  key: string | number;
  value: string | number;
  data: IData[];
}
