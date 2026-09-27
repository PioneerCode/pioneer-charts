import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PcacBarVerticalChart, PcacBarVerticalChartConfig, PcacLegend, PcacLegendConfig, PcacLegendConfigItem } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-legend',
  templateUrl: './legend.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutPageDocs,
    PcacBarVerticalChart,
    PcacLegend,
    LayoutResourceState,
    RouterLink,
  ]
})
export class LegendComponent {
  pcService = inject(AppService);
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Legend',
      value: 'legend',
    },
    {
      key: 'When To Use',
      value: 'when-to-use',
    },
    {
      key: 'Driving A Chart',
      value: 'driving-a-chart',
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
    }
  ])
  markupCode = `<pcac-legend [(config)]="config" (itemClicked)="onItemClicked($event)" />`;
  importCode = `import { PcacLegend, PcacLegendConfig, PcacLegendConfigItem } from '@pioneer-code/pioneer-charts';`;

  onItemClicked(_: PcacLegendConfigItem[]) {
    alert('Legend item clicked.');
  }

  // The "Driving A Chart" example - the code in `chartCode` below, which the page shows (there,
  // `config` is a signal of your own; here it's the grouped-bars mock, less its thresholds).
  private readonly weeksConfig = computed<PcacBarVerticalChartConfig>(() => ({
    ...this.pcService.barVerticalChartGroupConfig.value(),
    thresholds: [],
  }));

  /** The weeks switched off from the legend. */
  readonly hidden = signal<ReadonlySet<string>>(new Set());

  /** One item per week, in the order the chart colors them: the order the weeks first appear. */
  readonly legend = computed<PcacLegendConfig>(() => ({
    heading: 'Week',
    items: [...new Set((this.weeksConfig().data ?? []).flatMap((group) => group.data.map((bar) => String(bar.key))))]
      .map((week) => ({ label: week, checked: !this.hidden().has(week), colorOverride: null })),
  }));

  readonly bars = computed<PcacBarVerticalChartConfig>(() => ({
    ...this.weeksConfig(),
    data: (this.weeksConfig().data ?? []).map((group) => ({
      ...group,
      data: group.data.map((bar) => ({ ...bar, hide: this.hidden().has(String(bar.key)) })),
    })),
  }));

  onWeeksClicked(items: PcacLegendConfigItem[]): void {
    this.hidden.set(new Set(items.filter((item) => !item.checked).map((item) => item.label)));
  }

  chartCode = `import { Component, computed, signal } from '@angular/core';
import { PcacBarVerticalChart, PcacBarVerticalChartConfig, PcacLegend, PcacLegendConfig, PcacLegendConfigItem } from '@pioneer-code/pioneer-charts';

@Component({
  imports: [PcacLegend, PcacBarVerticalChart],
  template: \`
    <pcac-legend [config]="legend()" (itemClicked)="onWeeksClicked($event)" />
    <pcac-bar-vertical-chart [config]="bars()" />
  \`,
})
export class SalesComponent {
  // Groups (products), each with a bar per week: { key: 'Chips', data: [{ key: 'Week 1', value: 687 }, ...] }
  readonly config = signal<PcacBarVerticalChartConfig>({ data: [ ... ], height: 200 });

  /** The weeks switched off from the legend. */
  readonly hidden = signal<ReadonlySet<string>>(new Set());

  /** One item per week, in the order the chart colors them: the order the weeks first appear. */
  readonly legend = computed<PcacLegendConfig>(() => ({
    heading: 'Week',
    items: [...new Set(this.config().data.flatMap((group) => group.data.map((bar) => String(bar.key))))]
      .map((week) => ({ label: week, checked: !this.hidden().has(week), colorOverride: null })),
  }));

  readonly bars = computed<PcacBarVerticalChartConfig>(() => ({
    ...this.config(),
    data: this.config().data.map((group) => ({
      ...group,
      data: group.data.map((bar) => ({ ...bar, hide: this.hidden().has(String(bar.key)) })),
    })),
  }));

  onWeeksClicked(items: PcacLegendConfigItem[]): void {
    this.hidden.set(new Set(items.filter((item) => !item.checked).map((item) => item.label)));
  }
}`;
}
