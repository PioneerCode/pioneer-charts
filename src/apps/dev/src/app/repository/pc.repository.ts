import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IPcacTableConfig,
  IPcacBarHorizontalChartConfig,
  IPcacBarVerticalChartConfig,
  IPcacLineAreaChartConfig,
  IPcacPieChartConfig,
  IPcacData
} from '@pioneer-code/pioneer-charts';

@Injectable()
export class PcRepository {

  constructor(private http: HttpClient) { }

  getTable() {
    return this.http.get<IPcacTableConfig>('./assets/mock/table.json');
  }

  getBarHorizontalChart() {
    return this.http.get<IPcacBarHorizontalChartConfig>('./assets/mock/bar-charts/bar-horizontal-chart.json');
  }

  getBarHorizontalChartGroup() {
    return this.http.get<IPcacBarHorizontalChartConfig>('./assets/mock/bar-charts/bar-horizontal-chart-group.json');
  }

  getBarHorizontalChartStacked() {
    return this.http.get<IPcacBarHorizontalChartConfig>('./assets/mock/bar-charts/bar-horizontal-chart-stacked.json');
  }

  getBarVerticalChart() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-charts/bar-vertical-chart.json');
  }

  getBarVerticalChartGroup() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-charts/bar-vertical-chart-group.json');
  }

  getBarVerticalChartStacked() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-charts/bar-vertical-chart-stacked.json');
  }

  getLineChart() {
    return this.http.get<IPcacLineAreaChartConfig>('./assets/mock/line-chart.json');
  }

  getAreaChart() {
    return this.http.get<IPcacLineAreaChartConfig>('./assets/mock/area-chart.json');
  }

  getPieChartConfig() {
    return this.http.get<IPcacPieChartConfig>('./assets/mock/pie-chart.json');
  }

  getShareConfig() {
    return this.http.get<IPcacData[]>('./assets/mock/shared-config.json');
  }
}
