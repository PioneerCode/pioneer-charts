import { Component, OnInit } from '@angular/core';
import { PcacRepository } from './repository/pcac.repository';
import {
  ITableConfig,
  IBarChartConfig,
  ILineAreaChartConfig
} from '@pioneer-code/pioneer-code-angular-charts';

@Component({
  selector: 'pcac-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Pioneer Code Angular Charts';
  tableConfig: ITableConfig;
  barChartConfig: IBarChartConfig;
  lineChartConfig: ILineAreaChartConfig;
  areaChartConfig: ILineAreaChartConfig;
  constructor(private repository: PcacRepository) { }

  ngOnInit() {
    this.repository.getTable()
      .subscribe(data => this.tableConfig = data);

    this.repository.getBarChart()
      .subscribe(data => this.barChartConfig = data);

    this.repository.getLineChart()
      .subscribe(data => this.lineChartConfig = data);

    this.repository.getAreaChart()
    .subscribe(data => this.areaChartConfig = data);
  }
}
