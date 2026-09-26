import { Component, inject, signal } from '@angular/core';
import { PcacBarHorizontalChartComponent, PcacBarVerticalChartComponent } from '@pioneer-code/pioneer-charts';
import { RouterLink } from '@angular/router';

import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-bar-chart',
  templateUrl: './bar-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    RouterLink,
    PcacBarHorizontalChartComponent,
    PcacBarVerticalChartComponent,
    LayoutResourceState
  ]
})
export class BarChartComponent {
  verticalCode = `<pcac-bar-vertical-chart [config]="barVerticalChartConfig" (barClicked)="onClicked($event)"></pcac-bar-vertical-chart>`;
  horizontalCode = `<pcac-bar-horizontal-chart [config]="barHorizontalChartConfig" (barClicked)="onClicked($event)"></pcac-bar-horizontal-chart>`;
  importCode = `import { PcacBarVerticalChartComponent, PcacBarHorizontalChartComponent } from '@pioneer-code/pioneer-charts';`;
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Bar Chart',
      value: 'bar-chart',
    },
    {
      key: 'Markup',
      value: 'markup',
    },
    {
      key: 'Horizontal',
      value: 'horizontal',
    },
    {
      key: 'Vertical',
      value: 'vertical',
    },
    {
      key: 'API',
      value: 'api',
    },
    {
      key: 'Configuration',
      value: 'configuration',
    },
    {
      key: 'Events',
      value: 'events',
    }
  ]);

  readonly service = inject(AppService);
}
