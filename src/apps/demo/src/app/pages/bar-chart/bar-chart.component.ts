import { Component } from '@angular/core';
import { PcacService } from '../../services/pcac.service';
import { IPcacData } from 'libs/pcac/src/core';
import { PcacRepository } from '../../repository/pcac.repository';
import { IPcacBarHorizontalChartConfig } from 'libs/pcac/public-api';

@Component({
  selector: 'pc-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {
  verticalCode = `<pcac-bar-vertical-chart [config]="barVerticalChartConfig"></pcac-bar-vertical-chart>`;
  horizontalCode = `<pcac-bar-horizontal-chart [config]="barHorizontalChartConfig"></pcac-bar-horizontal-chart>`;
  importCode = `import {MatCheckboxModule} from '@angular/material/checkbox';`;
  config: IPcacBarHorizontalChartConfig;

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
