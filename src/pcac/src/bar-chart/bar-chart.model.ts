import { IChart } from "chart.model";
import { IHeaderConfig } from "src/header/header.model";

export interface IBarChartConfig extends IChart {
  headerConfig: IHeaderConfig;
}
