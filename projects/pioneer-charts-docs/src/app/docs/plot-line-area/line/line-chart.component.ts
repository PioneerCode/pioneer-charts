import { Component, inject } from '@angular/core';
import { PcacLineChart } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../../app.service';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';
import { ChartCard } from '../../../layout/chart-card/chart-card';
import { ChartContract } from '../../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-line-chart',
  templateUrl: './line-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    PlotLineAreaBaseComponent,
    PcacLineChart,
    LayoutResourceState,
  ]
})
export class LineChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-line-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacLineChart } from '@pioneer-code/pioneer-charts';`;
}
