import { Injectable } from '@angular/core';
import {
  IPcacLineAreaChartConfig,
  IPcacPieChartConfig,
  IPcacData,
  IPcacBarVerticalChartConfig,
  IPcacBarHorizontalChartConfig
} from 'pioneer-charts';

import { PcRepository } from '../repository/pc.repository';


@Injectable({
  providedIn: 'root',
})
export class PcService {
  barVerticalChartConfig!: IPcacBarVerticalChartConfig;
  barVerticalChartSingleConfig!: IPcacBarVerticalChartConfig;
  barVerticalChartGroupConfig!: IPcacBarVerticalChartConfig;
  barVerticalChartStackedConfig!: IPcacBarVerticalChartConfig;
  barHorizontalChartConfig!: IPcacBarHorizontalChartConfig;
  barHorizontalChartSingleConfig!: IPcacBarHorizontalChartConfig;
  barHorizontalChartGroupConfig!: IPcacBarHorizontalChartConfig;
  barHorizontalChartStackedConfig!: IPcacBarHorizontalChartConfig;
  lineChartConfig!: IPcacLineAreaChartConfig;
  areaChartConfig!: IPcacLineAreaChartConfig;
  areaChartHideConfig!: IPcacLineAreaChartConfig;
  pieChartConfig!: IPcacPieChartConfig;
  sharedConfig!: IPcacData[];
  currentMainRoute = 'home';
  currentDocRoute = 'bar-chart';
  navDisplay = 'none';

  constructor(private repository: PcRepository) { }

  onClicked(data: IPcacData) {
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
