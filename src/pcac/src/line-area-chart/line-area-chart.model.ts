import { IChart } from 'chart.model';
import { IHeaderConfig } from 'src/header/header.model';

export interface ILineAreaChartConfig extends IChart  {
  headerConfig: IHeaderConfig;
  domainMax: number;
  isArea: boolean;
}
