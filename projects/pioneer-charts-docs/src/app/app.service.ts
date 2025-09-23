import { inject, Injectable, signal } from '@angular/core';
import { AppRepository } from './app.repository';
import { PcacBarHorizontalChartConfig, PcacBarVerticalChartConfig, PcacData, PcacLegendConfig, PcacLineAreaChartConfig, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';


export enum MainRoutes {
  HOME = 'home',
  GET_STARTED = 'get-started',
  CHARTS = 'charts',
  API = 'api'
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly repository = inject(AppRepository);

  mainRoute = signal<MainRoutes>(MainRoutes.HOME);

  pieChartConfig = signal<PcacPieChartConfig>(new PcacPieChartConfig());
  sharedConfig = signal<PcacData[]>([]);

  barVerticalChartConfig = signal<PcacBarVerticalChartConfig>(new PcacBarVerticalChartConfig());
  barVerticalChartSingleConfig = signal<PcacBarVerticalChartConfig>(new PcacBarVerticalChartConfig());
  barVerticalChartGroupConfig = signal<PcacBarVerticalChartConfig>(new PcacBarVerticalChartConfig());
  barVerticalChartStackedConfig = signal<PcacBarVerticalChartConfig>(new PcacBarVerticalChartConfig());

  barHorizontalChartConfig = signal<PcacBarHorizontalChartConfig>(new PcacBarHorizontalChartConfig());
  barHorizontalChartSingleConfig = signal<PcacBarHorizontalChartConfig>(new PcacBarHorizontalChartConfig());
  barHorizontalChartGroupConfig = signal<PcacBarHorizontalChartConfig>(new PcacBarHorizontalChartConfig());
  barHorizontalChartStackedConfig = signal<PcacBarHorizontalChartConfig>(new PcacBarHorizontalChartConfig());

  lineChartConfig = signal<PcacLineAreaChartConfig>(new PcacLineAreaChartConfig());
  areaChartConfig = signal<PcacLineAreaChartConfig>(new PcacLineAreaChartConfig());
  areaChartHideConfig = signal<PcacLineAreaChartConfig>(new PcacLineAreaChartConfig());

  legendConfig = signal<PcacLegendConfig>(new PcacLegendConfig());

  getData() {
    this.getBarCharts();
    this.getLineAreaCharts();

    this.repository.getPieChartConfig()
      .subscribe(data => this.pieChartConfig.set(data));

    this.repository.getShareConfig()
      .subscribe(data => this.sharedConfig.set(data));

    this.repository.getLegendConfig()
      .subscribe(data =>  this.legendConfig.set(data[0]));
  }

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }

  private getLineAreaCharts() {
    this.repository.getLineChart()
      .subscribe(data => this.lineChartConfig.set(data));
    this.repository.getAreaChart()
      .subscribe(data => this.areaChartConfig.set(data));
    this.repository.getAreaHideChart()
      .subscribe(data => this.areaChartHideConfig.set(data));
  }

  private getBarCharts() {
    this.getBarChartsVertical();
    this.getBarChartsHorizontal();
  }

  private getBarChartsHorizontal() {
    this.repository.getBarHorizontalChart()
      .subscribe(data => this.barHorizontalChartConfig.set(data));
    this.repository.getBarHorizontalChartSingle()
      .subscribe(data => this.barHorizontalChartSingleConfig.set(data));
    this.repository.getBarHorizontalChartGroup()
      .subscribe(data => this.barHorizontalChartGroupConfig.set(data));
    this.repository.getBarHorizontalChartStacked()
      .subscribe(data => this.barHorizontalChartStackedConfig.set(data));
  }

  private getBarChartsVertical() {
    this.repository.getBarVerticalChart()
      .subscribe(data => this.barVerticalChartConfig.set(data));
    this.repository.getBarVerticalChartSingle()
      .subscribe(data => this.barVerticalChartSingleConfig.set(data));
    this.repository.getBarVerticalChartGroup()
      .subscribe(data => this.barVerticalChartGroupConfig.set(data));
    this.repository.getBarVerticalChartStacked()
      .subscribe(data => this.barVerticalChartStackedConfig.set(data));
  }
}
