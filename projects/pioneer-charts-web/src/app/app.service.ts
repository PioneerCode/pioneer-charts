import { inject, Injectable } from '@angular/core';
import {
  PcacLineAreaChartConfig,
  PcacPieChartConfig,
  PcacData,
  PcacBarVerticalChartConfig,
  PcacBarHorizontalChartConfig
} from '@pioneer-code/pioneer-charts';

import { AppRepository } from './app.repository';


@Injectable({
  providedIn: 'root',
})
export class AppService {
  barVerticalChartConfig!: PcacBarVerticalChartConfig;
  barVerticalChartSingleConfig!: PcacBarVerticalChartConfig;
  barVerticalChartGroupConfig!: PcacBarVerticalChartConfig;
  barVerticalChartStackedConfig!: PcacBarVerticalChartConfig;
  barHorizontalChartConfig!: PcacBarHorizontalChartConfig;
  barHorizontalChartSingleConfig!: PcacBarHorizontalChartConfig;
  barHorizontalChartGroupConfig!: PcacBarHorizontalChartConfig;
  barHorizontalChartStackedConfig!: PcacBarHorizontalChartConfig;
  lineChartConfig!: PcacLineAreaChartConfig;
  areaChartConfig!: PcacLineAreaChartConfig;
  areaChartHideConfig!: PcacLineAreaChartConfig;
  pieChartConfig!: PcacPieChartConfig;
  sharedConfig!: PcacData[];
  currentMainRoute = 'home';
  currentDocRoute = 'bar-chart';
  navDisplay = 'block';

  private readonly repository = inject(AppRepository);

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }

  getData() {
    this.getBarCharts();
    this.getLineAreaCharts();

    this.repository.getPieChartConfig()
      .subscribe(data => this.pieChartConfig = data);

    this.repository.getShareConfig()
      .subscribe(data => this.sharedConfig = data);
  }

  private getLineAreaCharts() {
    this.repository.getLineChart()
      .subscribe(data => this.lineChartConfig = data);
    this.repository.getAreaChart()
      .subscribe(data => this.areaChartConfig = data);
    this.repository.getAreaHideChart()
      .subscribe(data => this.areaChartHideConfig = data);
  }

  private getBarCharts() {
    this.getBarChartsVertical();
    this.getBarChartsHorizontal();
  }

  private getBarChartsHorizontal() {
    this.repository.getBarHorizontalChart()
      .subscribe(data => this.barHorizontalChartConfig = data);
    this.repository.getBarHorizontalChartSingle()
      .subscribe(data => this.barHorizontalChartSingleConfig = data);
    this.repository.getBarHorizontalChartGroup()
      .subscribe(data => this.barHorizontalChartGroupConfig = data);
    this.repository.getBarHorizontalChartStacked()
      .subscribe(data => this.barHorizontalChartStackedConfig = data);
  }

  private getBarChartsVertical() {
    this.repository.getBarVerticalChart()
      .subscribe(data => this.barVerticalChartConfig = data);
    this.repository.getBarVerticalChartSingle()
      .subscribe(data => this.barVerticalChartSingleConfig = data);
    this.repository.getBarVerticalChartGroup()
      .subscribe(data => this.barVerticalChartGroupConfig = data);
    this.repository.getBarVerticalChartStacked()
      .subscribe(data => this.barVerticalChartStackedConfig = data);
  }
}
