import { Component, inject } from '@angular/core';
import { PcacLineChart } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../../app.service';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';
import { ChartCard } from '../../../layout/chart-card/chart-card';
import { ChartContract } from '../../../layout/chart-contract/chart-contract';
import { LayoutCode } from '../../../layout/code/code';
import { freeSpaceConfig } from './point-color-demo';

@Component({
  selector: 'pc-line-chart',
  templateUrl: './line-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    PlotLineAreaBaseComponent,
    PcacLineChart,
    LayoutCode,
    LayoutResourceState,
  ]
})
export class LineChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-line-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacLineChart } from '@pioneer-code/pioneer-charts';`;

  protected readonly freeSpaceConfig = freeSpaceConfig();
  pointColorCode = `// Each reading below the threshold drawn red
const points = readings.map((free) => ({
  key: free.time, value: free.share, hide: false, data: [],
  ...(free.share < 0.1 ? { color: '#bb2d3b' } : {}),
}));

const config: PcacLineChartConfig = {
  ...new PcacLineChartConfig(),
  data: [{ key: 'Free space', value: null, hide: false, data: points }],
  yAxis: { format: PcacFormatEnum.Percentage, domainMin: 0, domainMax: 0.5 },
  referenceLines: [{ axis: 'y', value: 0.1, label: 'Threshold 10%' }],
};`;
}
