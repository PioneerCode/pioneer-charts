import { Component, OnInit } from '@angular/core';
import { PcacRepository } from './repository/pcac.repository';
import {
  ITableConfig,
  ILineAreaChartConfig,
  IPcacBarChartConfig
} from '@pioneer-code/pioneer-code-angular-charts';
import { PcacService } from './services/pcac.service';

@Component({
  selector: 'pcac-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Pioneer Code Angular Charts';

  constructor(private pcacService: PcacService) { }

  ngOnInit() {
    this.pcacService.getData();
  }
}
