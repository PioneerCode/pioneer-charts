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
    { key: 'With A Legend', value: 'with-a-legend' },
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

  markupCode = `<pcac-pie-chart [config]="config" (sliceClicked)="onClicked($event)" />`;
  importCode = `import { PcacPieChart, PcacPieChartConfig } from '@pioneer-code/pioneer-charts';`;
}
