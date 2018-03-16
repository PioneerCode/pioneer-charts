import { Component, OnInit } from '@angular/core';
import { PcacRepository } from '../../repository/pcac.repository';
import { ITableConfig, IPcacBarChartConfig, ILineAreaChartConfig } from '@pioneer-code/pioneer-code-angular-charts';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tableConfig: ITableConfig;
  barChartConfig: IPcacBarChartConfig;
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
