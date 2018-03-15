import { IHeaderConfig } from '../header';
import { IChart } from '../chart.model';


export interface ILineAreaChartConfig extends IChart  {
  headerConfig: IHeaderConfig;
  domainMax: number;
  isArea: boolean;
}
