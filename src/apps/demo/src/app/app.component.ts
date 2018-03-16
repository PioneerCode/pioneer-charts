import { Component, OnInit } from '@angular/core';
import { PcacRepository } from './repository/pcac.repository';
import {
  ITableConfig,
  ILineAreaChartConfig,
  IPcacBarChartConfig
} from '@pioneer-code/pioneer-code-angular-charts';

@Component({
  selector: 'pcac-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Pioneer Code Angular Charts';
  constructor() { }
}
