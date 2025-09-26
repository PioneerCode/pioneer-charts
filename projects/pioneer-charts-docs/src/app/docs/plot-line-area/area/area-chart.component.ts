import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacAreaChart } from '@pioneer-code/pioneer-charts';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { IJumpNav } from '../../../layout/page-docs/jump-nav/jump-nav';
import { PlotLineAreaBaseComponent } from '../base/base.component';



@Component({
  selector: 'pc-area-chart',
  templateUrl: './area-chart.component.html',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacAreaChart,
    StringifyPipe
  ]
})
export class AreaChartComponent {
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
  markupCode = `<pcac-area-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacAreaChart } from '@pioneer-code/pioneer-charts';`;
}

