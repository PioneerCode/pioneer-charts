import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITableConfig, IBarChartConfig, ILineAreaChartConfig } from '@pioneer-code/pioneer-code-angular-charts';


@Injectable()
export class PcacRepository {

  constructor(private http: HttpClient) { }

  getTable() {
    return this.http.get<ITableConfig>('./assets/mock/table.json');
  }

  getBarChart() {
    return this.http.get<IBarChartConfig>('./assets/mock/bar-chart.json');
  }

  getLineChart() {
    return this.http.get<ILineAreaChartConfig>('./assets/mock/line-chart.json');
  }

  getAreaChart() {
    return this.http.get<ILineAreaChartConfig>('./assets/mock/area-chart.json');
  }
}
