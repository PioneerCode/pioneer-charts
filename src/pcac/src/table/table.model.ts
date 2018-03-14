import { IHeaderConfig } from "src/header/header.model";
import { IChart } from "chart.model";

export interface ITableConfig extends IChart {
  headerConfig: IHeaderConfig;
}
