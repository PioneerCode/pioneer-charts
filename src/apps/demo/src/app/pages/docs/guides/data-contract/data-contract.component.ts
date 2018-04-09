import { Component } from '@angular/core';
import { IJumpNav } from '../../../layouts/doc/doc.component';

@Component({
  selector: 'pc-data-contract',
  templateUrl: './data-contract.component.html',
  styleUrls: ['./data-contract.component.scss']
})
export class DataContractComponent {
  jumpNav = [
    {
      key: 'IPcacData',
      value: 'data'
    },
    {
      key: 'IPcacChartConfig',
      value: 'chart-config'
    }, {
      key: 'New Chart Config',
      value: 'new-chart-config'
    }

  ] as IJumpNav[];

  data = `export interface IPcacData {
  key: string | number;
  value: string | number;
  data: IPcacData[];
}`;

  baseConfig = `export interface IPcacChartConfig {
  /**
   * Height in pixels
   */
  height: number;
  ...
  data: IPcacData[];
}`;

  barChartConfig = `import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacBarVerticalChartConfig extends IPcacChartConfig {
  domainMax: number;
  numberOfTicks: number;
  ...
}`;

  bindConfig = `<pcac-bar-vertical-chart [config]="config"></pcac-bar-vertical-chart>`;

  typing = `const barVerticalChartConfig = { ... }  as IPcacBarVerticalChartConfig;`;
}
