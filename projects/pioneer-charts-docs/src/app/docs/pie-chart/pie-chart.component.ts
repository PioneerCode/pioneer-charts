import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PcacLegend, PcacLegendConfig, PcacLegendConfigItem, PcacPieChart, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    RouterLink,
    PcacLegend,
    PcacPieChart,
    LayoutResourceState,
  ]
})
export class PieChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    { key: 'Pie Chart', value: 'pie-chart' },
    { key: 'When To Use', value: 'when-to-use' },
    { key: 'How Slices Are Drawn', value: 'slices' },
    { key: 'With A Legend', value: 'with-a-legend' },
    { key: 'Handling Clicks', value: 'handling-clicks' },
    { key: 'Pie Or Donut?', value: 'pie-or-donut' },
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Configuration', value: 'configuration' },
    { key: 'Events', value: 'events' },
  ]);

  // The "With A Legend" example - exactly the code in `legendCode` below, which the page shows.
  /** The slices switched off from the legend, by key. */
  readonly hidden = signal<ReadonlySet<string>>(new Set());

  readonly legend = computed<PcacLegendConfig>(() => ({
    heading: 'Snacks',
    items: (this.pcService.pieChartConfig.value().data ?? []).map((slice) => ({
      label: String(slice.key),
      checked: !this.hidden().has(String(slice.key)),
      colorOverride: null,
    })),
  }));

  readonly pie = computed<PcacPieChartConfig>(() => {
    const config = this.pcService.pieChartConfig.value();
    return {
      ...config,
      data: (config.data ?? []).map((slice) => ({ ...slice, hide: this.hidden().has(String(slice.key)) })),
    };
  });

  onItemClicked(items: PcacLegendConfigItem[]): void {
    this.hidden.set(new Set(items.filter((item) => !item.checked).map((item) => item.label)));
  }

  legendCode = `import { Component, computed, signal } from '@angular/core';
import { PcacLegend, PcacLegendConfig, PcacLegendConfigItem, PcacPieChart, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';

@Component({
  imports: [PcacLegend, PcacPieChart],
  template: \`
    <pcac-legend [config]="legend()" (itemClicked)="onItemClicked($event)" />
    <pcac-pie-chart [config]="pie()" />
  \`,
})
export class SnacksComponent {
  readonly config = signal<PcacPieChartConfig>({ data: [ ... ], height: 200 });

  /** The slices switched off from the legend, by key. */
  readonly hidden = signal<ReadonlySet<string>>(new Set());

  readonly legend = computed<PcacLegendConfig>(() => ({
    heading: 'Snacks',
    items: this.config().data.map((slice) => ({
      label: String(slice.key),
      checked: !this.hidden().has(String(slice.key)),
      colorOverride: null,
    })),
  }));

  readonly pie = computed<PcacPieChartConfig>(() => ({
    ...this.config(),
    data: this.config().data.map((slice) => ({ ...slice, hide: this.hidden().has(String(slice.key)) })),
  }));

  onItemClicked(items: PcacLegendConfigItem[]): void {
    this.hidden.set(new Set(items.filter((item) => !item.checked).map((item) => item.label)));
  }
}`;

  dataCode = `import { PcacData, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';

const slice = (key: string, value: number, hide = false): PcacData => ({ key, value, hide, data: [] });

const config: PcacPieChartConfig = {
  height: 200,
  data: [
    slice('Brownie', 898),        // first: starts at twelve o'clock
    slice('Peanuts', 787),
    slice('Candy', 600),
    slice('Chocolate Chip', 300),
    slice('Chips', 123, true),    // hidden: counts as zero until shown
  ],
};`;

  clickCode = `import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PcacData, PcacPieChart, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';

@Component({
  imports: [PcacPieChart],
  template: \`<pcac-pie-chart [config]="config()" (sliceClicked)="open($event)" />\`,
})
export class SalesByRegionComponent {
  private readonly router = inject(Router);

  readonly config = signal<PcacPieChartConfig>({
    height: 240,
    data: [
      { id: 'na', key: 'North America', value: 412, hide: false, data: [] },
      { id: 'eu', key: 'Europe', value: 305, hide: false, data: [] },
      { id: 'apac', key: 'Asia Pacific', value: 188, hide: false, data: [] },
    ],
  });

  open(slice: PcacData): void {
    this.router.navigate(['/sales/regions', slice.id]);
  }
}`;

  markupCode = `<pcac-pie-chart [config]="config" (sliceClicked)="onClicked($event)" />`;
  importCode = `import { PcacPieChart, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';`;
}
