import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PcacLegend } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { StringifyPipe } from '../../stringify.pipe';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';


@Component({
  selector: 'pc-legend',
  templateUrl: './legend.component.html',
  imports: [
    LayoutCode,
    LayoutBaseConfig,
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
  markupCode = `<pcac-legend [config]="config"></pcac-legend>`;
  importCode = `import { PcacLegend } from '@pioneer-code/pioneer-charts';`;
}
