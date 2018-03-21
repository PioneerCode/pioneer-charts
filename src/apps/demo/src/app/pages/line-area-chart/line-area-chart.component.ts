import { Component } from '@angular/core';
import { PcacService } from '../../services/pcac.service';
import { IPcacData } from '@pioneer-code/pioneer-code-angular-charts';

@Component({
  selector: 'pc-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  styleUrls: ['./line-area-chart.component.scss']
})
export class LineAreaChartComponent {
  markupCode = `<pcac-line-area-chart [config]="pcacService.lineChartConfig"></pcac-line-area-chart>`;
  importCode = `import {PcacLineAreaChartModule} from '@pioneer-code/pioneer-code-angular-charts';`;
  constructor(public pcacService: PcacService) { }

  getConfig() {
    const rows = [
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
    return {
      'data': rows.concat(this.pcacService.sharedConfig || [])
    };
  }
}

