import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PcacProximityChart, PcacProximityChartConfig } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

/** The settings the "Try it" controls edit. */
interface ProximitySettings {
  showLabels: boolean;
  rings: boolean;
  showSpokes: boolean;
  itemSize: number;
}

@Component({
  selector: 'pc-proximity-chart',
  templateUrl: './proximity-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    RouterLink,
    PcacProximityChart,
    LayoutResourceState,
  ]
})
export class ProximityChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    { key: 'Proximity Chart', value: 'proximity-chart' },
    { key: 'Try it', value: 'try-it' },
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Configuration', value: 'configuration' },
    { key: 'Events', value: 'events' },
  ]);

  protected readonly settings = signal<ProximitySettings>({ showLabels: true, rings: true, showSpokes: true, itemSize: 28 });

  /** Same pattern as the Axis Styling page: a fresh config object so the chart rebuilds. */
  protected readonly config = computed<PcacProximityChartConfig>(() => {
    const { showLabels, rings, showSpokes, itemSize } = this.settings();
    const mock = this.pcService.proximityChartConfig.value();
    return {
      ...mock,
      showLabels,
      rings: rings ? mock.rings : [],
      showSpokes,
      itemSize,
      centerSize: 44,
      ariaLabel: 'Cities by how similar their climate is to Portland\'s',
    };
  });

  protected set<K extends keyof ProximitySettings>(field: K, value: ProximitySettings[K]): void {
    this.settings.update((settings) => ({ ...settings, [field]: value }));
  }

  /** The demo's own config, as code - so the sample always matches the chart above it. */
  protected readonly configCode = computed(() => {
    const { showLabels, rings, showSpokes, itemSize } = this.settings();
    return `const config: PcacProximityChartConfig = {
  center: { key: 'Portland', value: null, hide: false, data: [] },
  // Closest first: the first item sits at 12 o'clock, the rest clockwise.
  data: [
    { key: 'Seattle', value: 0.96, hide: false, data: [] },
    { key: 'Vancouver', value: 0.94, hide: false, data: [] },
    ...
  ],
  closeValue: 1,   // identical: right up against the center
  farValue: 0.5,   // on the outer rim
  format: PcacFormatEnum.Percentage,${showLabels ? `\n  showLabels: true,` : ''}${rings ? `\n  rings: [0.9, 0.8, 0.7, 0.6],` : ''}${showSpokes ? '' : `\n  showSpokes: false,`}
  itemSize: ${itemSize},
  centerSize: 44,
};`;
  });

  markupCode = `<pcac-proximity-chart [config]="config" (itemClicked)="onClicked($event)" />`;
  importCode = `import { PcacProximityChart, PcacProximityChartConfig } from '@pioneer-code/pioneer-charts';`;
}
