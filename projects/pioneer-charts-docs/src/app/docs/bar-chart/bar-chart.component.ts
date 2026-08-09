import { Component, inject, signal } from '@angular/core';
import { PcacBarHorizontalChartComponent, PcacBarVerticalChartComponent } from '@pioneer-code/pioneer-charts';
import { MatCardModule } from '@angular/material/card';

import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { AppService } from '../../app.service';
import { StringifyPipe } from '../../stringify.pipe';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-bar-chart',
  templateUrl: './bar-chart.component.html',
  imports: [
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    MatCardModule,
    StringifyPipe,
    PcacBarHorizontalChartComponent,
    PcacBarVerticalChartComponent
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
    },
    {
      key: 'Contract',
      value: 'contract',
    }
  ]);

  readonly service = inject(AppService);
}
