import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { IJumpNav } from '../../../layout/page-docs/jump-nav/jump-nav';
import { PcacPlotChart } from '@pioneer-code/pioneer-charts';
import { PlotLineAreaBaseComponent } from '../base/base.component';



@Component({
  selector: 'pc-plot-chart',
  templateUrl: './plot-chart.component.html',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacPlotChart,
    StringifyPipe
  ]
})
export class PlotChartComponent {
  pcService = inject(AppService);
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Plot Chart',
      value: 'plot-chart',
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
  markupCode = `<pcac-plot-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacPlotChart } from '@pioneer-code/pioneer-charts';`;
}

