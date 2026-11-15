import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PcacDonutChart, PcacDonutChartConfig } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

/** The ring settings the "Try it" controls edit. */
interface DonutSettings {
  innerRadius: number;
  label: string;
  subLabel: string;
}

@Component({
  selector: 'pc-donut-chart',
  templateUrl: './donut-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    RouterLink,
    PcacDonutChart,
    LayoutResourceState,
  ]
})
export class DonutChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    { key: 'Donut Chart', value: 'donut-chart' },
    { key: 'Try it', value: 'try-it' },
    { key: 'When To Use', value: 'when-to-use' },
    { key: 'One Value As A Ring', value: 'one-value' },
    { key: 'The Center Label', value: 'center-label' },
    { key: 'Ring Thickness', value: 'ring-thickness' },
    { key: 'Label Colors', value: 'label-colors' },
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Configuration', value: 'configuration' },
    { key: 'Events', value: 'events' },
  ]);

  /** Starts with no label of its own, so the center shows the total. */
  protected readonly settings = signal<DonutSettings>({ innerRadius: 0.6, label: '', subLabel: 'total' });

  /** The mock's slices add up to the default label, so it reads as a real total. */
  protected readonly total = computed(() =>
    (this.pcService.pieChartConfig.value().data ?? []).reduce((sum, d) => sum + Number(d.value ?? 0), 0),
  );

  /** Same pattern as the Axis Styling page: a fresh config object so the chart rebuilds. */
  protected readonly config = computed<PcacDonutChartConfig>(() => {
    const settings = this.settings();
    return {
      ...this.pcService.pieChartConfig.value(),
      ...settings,
      label: settings.label || String(this.total()),
    };
  });

  protected set<K extends keyof DonutSettings>(field: K, value: DonutSettings[K]): void {
    this.settings.update((settings) => ({ ...settings, [field]: value }));
  }

  /** The demo's own config, as code - so the sample always matches the chart above it. */
  protected readonly configCode = computed(() => {
    const { innerRadius, label, subLabel } = this.config();
    return `const config: PcacDonutChartConfig = {
  data: [...],
  innerRadius: ${innerRadius},
  label: '${label}',
  subLabel: '${subLabel}',
};`;
  });

  /** The "One Value As A Ring" example - exactly the config `progressCode` shows. */
  protected readonly progress: PcacDonutChartConfig = {
    height: 200,
    innerRadius: 0.8,
    label: '72%',
    subLabel: 'on time',
    colorOverride: ['#5ee2a0', 'light-dark(#e5e7eb, #3f3f46)'],
    data: [
      { key: 'On time', value: 72, hide: false, data: [] },
      { key: 'Late', value: 28, hide: false, data: [] },
    ],
  };

  progressCode = `const config: PcacDonutChartConfig = {
  height: 200,
  innerRadius: 0.8,
  label: '72%',
  subLabel: 'on time',
  colorOverride: ['#5ee2a0', 'light-dark(#e5e7eb, #3f3f46)'], // the part, then a quiet remainder
  data: [
    { key: 'On time', value: 72, hide: false, data: [] },
    { key: 'Late', value: 28, hide: false, data: [] },
  ],
};`;

  totalCode = `const data: PcacData[] = [ ... ];
const total = data.filter((d) => !d.hide).reduce((sum, d) => sum + Number(d.value ?? 0), 0);

const config: PcacDonutChartConfig = {
  data,
  label: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(total),
  subLabel: 'total spend',
};`;

  labelCss = `.dark-card {
  --pcac-donut-center-label-color: #f4f4f5;
  --pcac-donut-center-sub-label-color: #a1a1aa;
}`;

  markupCode = `<pcac-donut-chart [config]="config" (sliceClicked)="onClicked($event)" />`;
  importCode = `import { PcacDonutChart, PcacDonutChartConfig } from '@pioneer-code/pioneer-charts';`;
}
