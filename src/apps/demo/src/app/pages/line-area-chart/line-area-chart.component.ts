import { Component } from '@angular/core';
import { PcacService } from '../../services/pcac.service';
import { IPcacData } from '@pioneer-code/pioneer-code-angular-charts';

@Component({
  selector: 'pc-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  styleUrls: ['./line-area-chart.component.scss']
})
export class LineAreaChartComponent {
  constructor(public pcacService: PcacService) { }

  getConfig() {
    let rows = [
      {
        'data': [
          {
            'value': 'Name'
          },
          {
            'value': 'Description'
          }
        ]
      },
      {
        'data': [
          {
            'value': 'domainMax'
          },
          {
            'value': 'Max value in data-set domain.'
          }
        ]
      }
    ] as IPcacData[];
    rows = rows.concat(this.pcacService.sharedConfig || []);
    return {
      'data': rows
    };
  }
}

