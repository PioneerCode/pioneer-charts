import { Component, inject, input, signal } from '@angular/core';
import { AppService } from '../../../app.service';
import { IJumpNav } from '../../../layout/page-docs/jump-nav/jump-nav';
import { LayoutBaseConfig } from '../../../layout/base-config/base-config.component';
import { LayoutCode } from '../../../layout/code/code';
import { LayoutPageDocs } from '../../../layout/page-docs/page-docs';

@Component({
  selector: 'app-plot-line-area-base',
  imports: [
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
  ],
  templateUrl: './base.component.html',
})
export class PlotLineAreaBaseComponent {
  readonly title = input.required<string>();
  readonly lead = input.required<string>();
  readonly markup = input.required<string>();
  readonly contract = input.required<string>();

  pcService = inject(AppService);
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Area Chart',
      value: 'area-chart',
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
