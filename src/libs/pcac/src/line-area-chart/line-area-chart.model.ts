import { IPcacChartConfig, IHeaderConfig } from '@pioneer-code/pioneer-code-angular-charts';

export interface ILineAreaChartConfig extends IPcacChartConfig  {
  headerConfig: IHeaderConfig;
  domainMax: number;
  isArea: boolean;
}
