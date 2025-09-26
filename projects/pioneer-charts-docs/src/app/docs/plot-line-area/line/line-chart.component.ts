import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacLineChart } from '@pioneer-code/pioneer-charts';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { LayoutBaseConfig } from '../../../layout/base-config/base-config.component';
import { LayoutCode } from '../../../layout/code/code';
import { LayoutPageDocs } from '../../../layout/page-docs/page-docs';
import { IJumpNav } from '../../../layout/page-docs/jump-nav/jump-nav';



@Component({
  selector: 'pc-line-chart',
  templateUrl: './line-chart.component.html',
  imports: [
    MatCardModule,
    PcacLineChart,
    StringifyPipe,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
  ]
})
export class LineChartComponent {
  pcService = inject(AppService);
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Line Chart',
      value: 'line-chart',
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
  markupCode = `<pcac-line-area-chart [config]="config" (dotClicked)="onClicked($event)"></pcac-line-area-chart>`;
  importCode = `import { PcacLineAreaChartModule } from '@pioneer-code/pioneer-charts';`;
}

