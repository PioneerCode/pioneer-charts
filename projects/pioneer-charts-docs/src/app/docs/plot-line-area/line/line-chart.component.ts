import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacLineChart } from '@pioneer-code/pioneer-charts';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { IJumpNav } from '../../../layout/page-docs/jump-nav/jump-nav';
import { PlotLineAreaBaseComponent } from '../base/base.component';



@Component({
  selector: 'pc-line-chart',
  templateUrl: './line-chart.component.html',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacLineChart,
    StringifyPipe,
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
  markupCode = `<pcac-line-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacLineChart } from '@pioneer-code/pioneer-charts';`;
}

