import { Injectable } from '@angular/core';

/**
 * Owns the mock data endpoint locations consumed by `AppService`'s `httpResource`s.
 */
@Injectable({
  providedIn: 'root',
})
export class AppRepository {
  /**
   * Bar Charts Horizontal
   */
  getBarHorizontalChartUrl() {
    return './mock/bar-charts/bar-horizontal-chart.json';
  }

  getBarHorizontalChartSingleUrl() {
    return './mock/bar-charts/bar-horizontal-chart-single.json';
  }

  getBarHorizontalChartGroupUrl() {
    return './mock/bar-charts/bar-horizontal-chart-group.json';
  }

  getBarHorizontalChartStackedUrl() {
    return './mock/bar-charts/bar-horizontal-chart-stacked.json';
  }

  /**
   * Bar Charts Vertical
   */
  getBarVerticalChartUrl() {
    return './mock/bar-charts/bar-vertical-chart.json';
  }

  getBarVerticalChartSingleUrl() {
    return './mock/bar-charts/bar-vertical-chart-single.json';
  }

  getBarVerticalChartGroupUrl() {
    return './mock/bar-charts/bar-vertical-chart-group.json';
  }

  getBarVerticalChartStackedUrl() {
    return './mock/bar-charts/bar-vertical-chart-stacked.json';
  }

  /**
   * Line Area Charts
   */
  getLineChartUrl() {
    return './mock/line-area-chart/line-chart.json';
  }

  getAreaChartUrl() {
    return './mock/line-area-chart/area-chart.json';
  }

  getAreaHideChartUrl() {
    return './mock/line-area-chart/area-chart-hide.json';
  }

  getLineChartImagesUrl() {
    return './mock/line-area-chart/line-chart-images.json';
  }

  getPlotChartUrl() {
    return './mock/line-area-chart/plot-chart.json';
  }

  getPlotChartImagesUrl() {
    return './mock/line-area-chart/plot-chart-images.json';
  }

  getPieChartConfigUrl() {
    return './mock/pie-chart.json';
  }

  getLegendConfigUrl() {
    return './mock/legend.json';
  }
}
