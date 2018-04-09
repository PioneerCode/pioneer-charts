import { Component, OnInit } from '@angular/core';
import { PcService } from '../../../../../services/pc.service';
import { IJumpNav } from '../../../../../components/jump-nav/jump-nav.component';

@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  jumpNav = [
    {
      key: 'Markup',
      value: 'markup',
    },
    {
      key: 'API',
      value: 'api',
      jump: [
        {
          key: 'Configuration',
          value: 'configuration',
        }
      ]
    }
  ] as IJumpNav[];
  constructor(public pcService: PcService) { }

  ngOnInit() {
  }
}
