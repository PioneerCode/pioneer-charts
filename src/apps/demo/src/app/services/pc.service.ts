import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IPcacData,
  IPcacTableConfig,
  IPcacBarVerticalChartConfig,
  IPcacLineAreaChartConfig,
  IPcacBarHorizontalChartConfig
} from '@pioneer-code/pioneer-code-angular-charts';
import { PcacRepository } from '../repository/pc.repository';


@Injectable()
export class PcacService {
  tableConfig: IPcacTableConfig;
  barVerticalChartConfig: IPcacBarVerticalChartConfig;
  barHorizontalChartConfig: IPcacBarHorizontalChartConfig;
  lineChartConfig: IPcacLineAreaChartConfig;
  areaChartConfig: IPcacLineAreaChartConfig;
  sharedConfig: IPcacData[];
  currentMainRoute = 'home';
  currentChartRoute = 'bar-chart';

  constructor(private repository: PcacRepository) { }

  getData() {
    this.repository.getTable()
      .subscribe(data => this.tableConfig = data);

    this.repository.getBarVerticalChart()
      .subscribe(data => this.barVerticalChartConfig = data);

    this.repository.getBarHorizontalChart()
      .subscribe(data => this.barHorizontalChartConfig = data);

    this.repository.getLineChart()
      .subscribe(data => this.lineChartConfig = data);

    this.repository.getAreaChart()
      .subscribe(data => this.areaChartConfig = data);

    this.repository.getShareConfig()
      .subscribe(data => this.sharedConfig = data);
  }
}
