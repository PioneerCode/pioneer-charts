import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PcacBarHorizontalChartConfig,
  PcacBarVerticalChartConfig,
  PcacPieChartConfig,
  PcacData,
  PcacLegendConfig,
  PcacLineChartConfig,
  PcacAreaChartConfig
} from '@pioneer-code/pioneer-charts';


@Injectable({
  providedIn: 'root',
})
export class AppRepository {
  private http = inject(HttpClient);


  /**
   * Bar Charts Horizontal
   */
  getBarHorizontalChart() {
    return this.http.get<PcacBarHorizontalChartConfig>('./mock/bar-charts/bar-horizontal-chart.json');
  }

  getBarHorizontalChartSingle() {
    return this.http.get<PcacBarHorizontalChartConfig>('./mock/bar-charts/bar-horizontal-chart-single.json');
  }

  getBarHorizontalChartGroup() {
    return this.http.get<PcacBarHorizontalChartConfig>('./mock/bar-charts/bar-horizontal-chart-group.json');
  }

  getBarHorizontalChartStacked() {
    return this.http.get<PcacBarHorizontalChartConfig>('./mock/bar-charts/bar-horizontal-chart-stacked.json');
  }

  /**
   * Bar Charts Vertical
   */
  getBarVerticalChart() {
    return this.http.get<PcacBarVerticalChartConfig>('./mock/bar-charts/bar-vertical-chart.json');
  }

  getBarVerticalChartSingle() {
    return this.http.get<PcacBarVerticalChartConfig>('./mock/bar-charts/bar-vertical-chart-single.json');
  }

  getBarVerticalChartGroup() {
    return this.http.get<PcacBarVerticalChartConfig>('./mock/bar-charts/bar-vertical-chart-group.json');
  }

  getBarVerticalChartStacked() {
    return this.http.get<PcacBarVerticalChartConfig>('./mock/bar-charts/bar-vertical-chart-stacked.json');
  }

  /**
   * Line Area Charts
   */
  getLineChart() {
    return this.http.get<PcacLineChartConfig>('./mock/line-area-chart/line-chart.json');
  }

  getAreaChart() {
    return this.http.get<PcacAreaChartConfig>('./mock/line-area-chart/area-chart.json');
  }

  getAreaHideChart() {
    return this.http.get<PcacAreaChartConfig>('./mock/line-area-chart/area-chart-hide.json');
  }

  getPlotChart() {
    return this.http.get<PcacLineChartConfig>('./mock/line-area-chart/plot-chart.json');
  }

  getPieChartConfig() {
    return this.http.get<PcacPieChartConfig>('./mock/pie-chart.json');
  }

  getShareConfig() {
    return this.http.get<PcacData[]>('./mock/shared-config.json');
  }

  getLegendConfig() {
    return this.http.get<PcacLegendConfig>('./mock/legend.json');
  }
}
