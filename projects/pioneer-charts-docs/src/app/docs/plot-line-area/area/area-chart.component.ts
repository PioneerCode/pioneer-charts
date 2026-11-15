import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PcacAreaChart } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../../app.service';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';
import { ChartCard } from '../../../layout/chart-card/chart-card';
import { ChartContract } from '../../../layout/chart-contract/chart-contract';
import { LayoutCode } from '../../../layout/code/code';
import { IJumpNav } from '../../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-area-chart',
  templateUrl: './area-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    PlotLineAreaBaseComponent,
    RouterLink,
    PcacAreaChart,
    LayoutResourceState
  ]
})
export class AreaChartComponent {
  pcService = inject(AppService);
  lead = 'An Angular area chart built on D3: each series is a line with the space beneath it filled in, so it'
    + ' shows how much as well as which way. With zoom, a hover crosshair, point images and ranges.';
  sections: IJumpNav[] = [
    { key: 'When To Use', value: 'when-to-use' },
    { key: 'How Areas Are Drawn', value: 'how-areas-are-drawn' },
    { key: 'Stacked Areas', value: 'stacked-areas' },
  ];
  stackCode = `import { PcacData } from '@pioneer-code/pioneer-charts';

/**
 * Stacks series that share the same x keys, in the same order: each point's value becomes the
 * running total of the series up to and including it. Returned tallest first, for drawing order.
 */
function stack(series: PcacData[]): PcacData[] {
  const totals = series[0]?.data.map(() => 0) ?? [];
  return series
    .map((s) => ({
      ...s,
      data: s.data.map((point, i) => ({ ...point, value: (totals[i] += Number(point.value ?? 0)) })),
    }))
    .reverse();
}

config = { ...config, data: stack(config.data) };`;
  markupCode = `<pcac-area-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacAreaChart } from '@pioneer-code/pioneer-charts';`;
}
