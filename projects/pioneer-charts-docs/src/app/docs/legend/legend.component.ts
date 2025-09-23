import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PcacLegend, PcacLegendConfigItem } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { StringifyPipe } from '../../stringify.pipe';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';


@Component({
  selector: 'pc-legend',
  templateUrl: './legend.component.html',
  imports: [
    LayoutCode,
    LayoutPageDocs,
    MatCardModule,
    PcacLegend,
    StringifyPipe,
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
    },
    {
      key: 'Contract',
      value: 'contract',
    }
  ])
  markupCode = `<pcac-legend [config]="config()"/>`;
  importCode = `import { PcacLegend } from '@pioneer-code/pioneer-charts';`;

  onItemClicked(_: PcacLegendConfigItem[]) {
    alert('Legend item clicked.');
  }
}
