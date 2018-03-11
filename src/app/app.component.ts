import { Component, OnInit } from '@angular/core';
import { ITableConfig } from './pcac/table/table.model';
import { PcacRepository } from './repository/pcac.repository';
import { ILineAreaChartConfig } from './pcac/line-area-chart/line-area-chart.model';
import { IBarChartConfig } from './pcac/bar-chart/bar-chart.model';

@Component({
  selector: 'pcac-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Pioneer Code Angular Charts';
  tableConfig: ITableConfig;
  barChartConfig: IBarChartConfig;
  lineAreaChartConfig: ILineAreaChartConfig;

  constructor(private repository: PcacRepository) { }

  ngOnInit() {
    this.repository.getTable()
      .subscribe(data => this.tableConfig = data);

    this.repository.getBarChart()
      .subscribe(data => this.barChartConfig = data);

    this.repository.getLineAreaChart()
      .subscribe(data => this.lineAreaChartConfig = data);
  }
}
