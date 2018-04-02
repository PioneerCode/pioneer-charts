import { Component } from '@angular/core';
import { PcService } from '../../../../../services/pc.service';
import { IPcacData } from '@pioneer-code/pioneer-charts';
import { IPcacBarHorizontalChartConfig } from 'libs/pcac/public_api';
import { IJumpNav } from '../../../../../components/doc-nav/doc-nav.component';

@Component({
  selector: 'pc-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {
  verticalCode = `<pcac-bar-vertical-chart [config]="barVerticalChartConfig"></pcac-bar-vertical-chart>`;
  horizontalCode = `<pcac-bar-horizontal-chart [config]="barHorizontalChartConfig"></pcac-bar-horizontal-chart>`;
  importCode = `import { PcacBarVerticalChartModule, PcacBarHorizontalChartModule } from '@pioneer-code/pioneer-charts';`;
  config: IPcacBarHorizontalChartConfig;
  jumpNav = [
    {
      key: 'Markup',
      value: 'markup',
      jump: [
        {
          key: 'Horizontal',
          value: 'horizontal',
        },
        {
          key: 'Vertical',
          value: 'vertical',
        }
      ]
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

  constructor(public pcacService: PcService) { }

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
