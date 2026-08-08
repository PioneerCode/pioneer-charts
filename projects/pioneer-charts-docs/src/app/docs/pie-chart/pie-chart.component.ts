import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PcacPieChartComponent } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { StringifyPipe } from '../../stringify.pipe';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';


@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  imports: [
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    MatCardModule,
    PcacPieChartComponent,
    StringifyPipe,
  ]
})
export class PieChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Pie Chart',
      value: 'pie-chart',
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
  markupCode = `<pcac-pie-chart [config]="config" (sliceClicked)="onClicked($event)"></pcac-pie-chart>`;
  importCode = `import { PcacPieChartModule } from '@pioneer-code/pioneer-charts';`;
}
