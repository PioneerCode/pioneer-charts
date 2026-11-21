import { Component, inject, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  PcacBarVerticalChart,
  PcacData,
  PcacLineChart,
  PcacPieChart,
  PcacTooltipDirective,
} from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  imports: [
    ChartCard,
    ChartContract,
    DecimalPipe,
    PercentPipe,
    RouterLink,
    LayoutCode,
    LayoutPageDocs,
    LayoutResourceState,
    PcacBarVerticalChart,
    PcacLineChart,
    PcacPieChart,
    PcacTooltipDirective,
  ]
})
export class TooltipComponent {
  readonly service = inject(AppService);

  /**
   * The hovered datum's share of everything alongside it - its group's, series' or (for the pie,
   * where there is no parent) the whole chart's total. Exists to show what `parent` is for: a
   * template gets the hovered point's siblings, not just the point.
   */
  protected share(point: PcacData, siblings: PcacData[] | undefined): number {
    const total = (siblings ?? []).reduce((sum, d) => sum + Number(d.value ?? 0), 0);
    return total ? Number(point.value ?? 0) / total : 0;
  }

  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Custom Tooltip',
      value: 'custom-tooltip',
    },
    {
      key: 'Try It',
      value: 'try-it',
    },
    {
      key: 'Markup',
      value: 'markup',
    },
    {
      key: 'Template Context',
      value: 'context',
    },
    {
      key: 'Your Own Data',
      value: 'your-own-data',
    },
    {
      key: 'Styling',
      value: 'styling',
    },
    {
      key: 'Notes',
      value: 'notes',
    }
  ]);

  markupCode = `<!-- Project an <ng-template pcacTooltip> into any chart. -->
<pcac-bar-vertical-chart [config]="config">
  <ng-template pcacTooltip let-point let-group="parent" let-threshold="isThreshold">
    <div class="my-tooltip">
      <strong>{{ group?.key }}</strong>
      <span>{{ point.key }}: {{ point.value | number }}</span>
      @if (threshold) {
        <em>threshold</em>
      }
    </div>
  </ng-template>
</pcac-bar-vertical-chart>`;

  importCode = `import { PcacBarVerticalChart, PcacTooltipDirective } from '@pioneer-code/pioneer-charts';

@Component({
  imports: [PcacBarVerticalChart, PcacTooltipDirective],
  // ...
})`;

  contextCode = `interface PcacTooltipContext {
  // The hovered data point: a bar, a line/area/plot point, a pie slice, or a threshold.
  $implicit: PcacData;

  // What the point belongs to: a bar's group, a point's series, or for a threshold, the data
  // group it's drawn against. null when there's no parent level (pie slices, a chart-wide
  // threshold).
  parent: PcacData | null;

  // true when the hovered item is a bar chart threshold marker instead of a data point.
  isThreshold: boolean;

  // The hovered point's position in parent.data (or in the top-level data when there's no
  // parent, such as a pie slice). For a threshold, its position in thresholds.
  index: number;

  // parent's position in the top-level data. null whenever parent is null.
  parentIndex: number | null;

  // Every *other* point drawn at exactly the same coordinate as the hovered one, in data order,
  // each described the same way ({ data, parent, index, parentIndex }). Filled in by the line,
  // area, and plot charts, whether or not the plot chart's pointFanOut has spread them apart.
  // Empty on the other charts, and when no other point shares the spot.
  coincident: PcacTooltipCoincident[];
}`;

  ownDataTsCode = `// Your source collection, grouped the same way as the chart: one entry per group and
// one item per bar. Build the chart's data from it without reordering or filtering.
regions: Region[] = [
  { name: 'North', orders: [{ customer: 'Acme', total: 1200 }, { customer: 'Globex', total: 800 }] },
  { name: 'South', orders: [{ customer: 'Initech', total: 950 }] },
];

config: PcacBarVerticalChartConfig = {
  ...new PcacBarVerticalChartConfig(),
  data: this.regions.map(region => ({
    key: region.name, value: null, hide: false,
    data: region.orders.map(order => ({ key: order.customer, value: order.total, hide: false, data: [] })),
  })),
};`;

  ownDataMarkupCode = `<!-- parentIndex picks the region, and index picks the order within it. -->
<pcac-bar-vertical-chart [config]="config">
  <ng-template pcacTooltip let-point let-i="index" let-g="parentIndex">
    @let order = regions[g!].orders[i];
    <div class="my-tooltip">
      <strong>{{ order.customer }}</strong>
      <span>{{ order.total | currency }}</span>
    </div>
  </ng-template>
</pcac-bar-vertical-chart>`;

  styleCode = `/* Your template controls the whole look, so style it however you like. */
.my-tooltip {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}`;
}
