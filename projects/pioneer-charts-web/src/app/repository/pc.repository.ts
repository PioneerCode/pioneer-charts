import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IPcacBarHorizontalChartConfig,
  IPcacBarVerticalChartConfig,
  IPcacLineAreaChartConfig,
  IPcacPieChartConfig,
  IPcacData
} from '@pioneer-code/pioneer-charts';


@Injectable({
  providedIn: 'root',
})
export class PcRepository {

  constructor(private http: HttpClient) { }

  /**
   * Bar Charts Horizontal
   */
  getBarHorizontalChart() {
    return this.http.get<IPcacBarHorizontalChartConfig>('./assets/mock/bar-charts/bar-horizontal-chart.json');
  }

  getBarHorizontalChartSingle() {
    return this.http.get<IPcacBarHorizontalChartConfig>('./assets/mock/bar-charts/bar-horizontal-chart-single.json');
  }

  getBarHorizontalChartGroup() {
    return this.http.get<IPcacBarHorizontalChartConfig>('./assets/mock/bar-charts/bar-horizontal-chart-group.json');
  }

  getBarHorizontalChartStacked() {
    return this.http.get<IPcacBarHorizontalChartConfig>('./assets/mock/bar-charts/bar-horizontal-chart-stacked.json');
  }

  /**
   * Bar Charts Vertical
   */
  getBarVerticalChart() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-charts/bar-vertical-chart.json');
  }

  getBarVerticalChartSingle() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-charts/bar-vertical-chart-single.json');
  }

  getBarVerticalChartGroup() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-charts/bar-vertical-chart-group.json');
  }

  getBarVerticalChartStacked() {
    return this.http.get<IPcacBarVerticalChartConfig>('./assets/mock/bar-charts/bar-vertical-chart-stacked.json');
  }

  /**
   * Line Area Charts
   */
  getLineChart() {
    return this.http.get<IPcacLineAreaChartConfig>('./assets/mock/line-area-chart/line-chart.json');
  }

  getAreaChart() {
    return this.http.get<IPcacLineAreaChartConfig>('./assets/mock/line-area-chart/area-chart.json');
  }

  getAreaHideChart() {
    return this.http.get<IPcacLineAreaChartConfig>('./assets/mock/line-area-chart/area-chart-hide.json');
  }

  getPieChartConfig() {
    return this.http.get<IPcacPieChartConfig>('./assets/mock/pie-chart.json');
  }

  getShareConfig() {
    return this.http.get<IPcacData[]>('./assets/mock/shared-config.json');
  }
}
