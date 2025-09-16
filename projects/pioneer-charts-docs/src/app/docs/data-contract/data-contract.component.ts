import { Component, signal } from '@angular/core';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-data-contract',
  templateUrl: './data-contract.component.html',
  imports: [
    LayoutCode,
    LayoutPageDocs
  ]
})
export class DataContractComponent {
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Data Contract',
      value: 'data-contract',
    },
    {
      key: 'PcacData',
      value: 'data',
    },
    {
      key: 'IPcacChartConfig',
      value: 'chart-config',
    },
    {
      key: 'New Chart Config',
      value: 'new-chart-config',
    },
    {
      key: 'Binding Configuration',
      value: 'map',
    }
  ])

  data = `export interface PcacData {
  key: string | number;
  value: string | number;
  data: PcacData[];
}`;

  baseConfig = `export interface IPcacChartConfig {
  /**
   * Height in pixels
   */
  height: number;
  ...
  data: PcacData[];
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
