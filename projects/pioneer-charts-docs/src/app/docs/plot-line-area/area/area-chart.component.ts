import { Component, inject } from '@angular/core';
import { PcacAreaChart } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../../app.service';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';
import { ChartCard } from '../../../layout/chart-card/chart-card';
import { ChartContract } from '../../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-area-chart',
  templateUrl: './area-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    PlotLineAreaBaseComponent,
    PcacAreaChart,
    LayoutResourceState
  ]
})
export class AreaChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-area-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacAreaChart } from '@pioneer-code/pioneer-charts';`;
}
