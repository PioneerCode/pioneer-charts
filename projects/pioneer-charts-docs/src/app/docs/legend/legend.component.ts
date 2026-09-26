import { Component, inject, signal } from '@angular/core';

import { PcacLegend, PcacLegendConfigItem } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-legend',
  templateUrl: './legend.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutPageDocs,
    PcacLegend,
    LayoutResourceState,
  ]
})
export class LegendComponent {
  pcService = inject(AppService);
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Legend',
      value: 'legend',
    },
    {
      key: 'Markup',
      value: 'markup',
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
  ])
  markupCode = `<pcac-legend [(config)]="config" (itemClicked)="onItemClicked($event)" />`;
  importCode = `import { PcacLegend, PcacLegendConfig, PcacLegendConfigItem } from '@pioneer-code/pioneer-charts';`;

  onItemClicked(_: PcacLegendConfigItem[]) {
    alert('Legend item clicked.');
  }
}
