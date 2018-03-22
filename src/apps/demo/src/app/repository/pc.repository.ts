import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITableConfig, IPcacBarVerticalChartConfig, ILineAreaChartConfig, IPcacData } from '@pioneer-code/pioneer-code-angular-charts';


@Injectable()
export class PcacRepository {

  constructor(private http: HttpClient) { }

  getTable() {
    return this.http.get<ITableConfig>('./assets/mock/table.json');
  }

  getBarHorizontalChart() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-vertical-chart.json');
  }

  getBarVerticalChart() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-horizontal-chart.json');
  }

  getLineChart() {
    return this.http.get<ILineAreaChartConfig>('./assets/mock/line-chart.json');
  }

  getAreaChart() {
    return this.http.get<ILineAreaChartConfig>('./assets/mock/area-chart.json');
  }

  getShareConfig() {
    return this.http.get<IPcacData[]>('./assets/mock/shared-config.json');
  }
}
