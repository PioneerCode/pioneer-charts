import { Component, OnInit } from '@angular/core';
import { PcService } from '../../../../../services/pc.service';
import { IJumpNav, JumpNavLevel } from '../../../../../components/jump-nav/jump-nav.component';

@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent {
  jumpNav = [
    {
      key: 'Line Area Chart',
      value: '',
      level: JumpNavLevel.h1
    },
    {
      key: 'Markup',
      value: 'markup',
      level: JumpNavLevel.h2
    },
    {
      key: 'API',
      value: 'api',
      level: JumpNavLevel.h2
    },
    {
      key: 'Configuration',
      value: 'configuration',
      level: JumpNavLevel.h3
    }
  ] as IJumpNav[];
  constructor(public pcService: PcService) { }

}
