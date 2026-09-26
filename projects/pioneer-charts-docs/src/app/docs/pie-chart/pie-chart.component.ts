import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PcacPieChart } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    RouterLink,
    PcacPieChart,
    LayoutResourceState,
  ]
})
export class PieChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    { key: 'Pie Chart', value: 'pie-chart' },
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Configuration', value: 'configuration' },
    { key: 'Events', value: 'events' },
  ]);

  markupCode = `<pcac-pie-chart [config]="config" (sliceClicked)="onClicked($event)" />`;
  importCode = `import { PcacPieChart, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';`;
}
