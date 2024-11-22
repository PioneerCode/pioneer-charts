import { Injectable, inject } from '@angular/core';
import {
  PcacLineAreaChartConfig,
  PcacData,
  PcacBarVerticalChartConfig,
  PcacBarHorizontalChartConfig,
  PcacPieChartConfig,
} from '@pioneer-code/pioneer-charts';
import { PcRepository } from './pc.repository';


@Injectable({
  providedIn: 'root',
})
export class PcService {
  private repository = inject(PcRepository);

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
  sharedConfig = [] as PcacData[];
  currentMainRoute = 'home';
  currentDocRoute = 'bar-chart';
  navDisplay = 'none';

  onClicked(data: any) {
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
