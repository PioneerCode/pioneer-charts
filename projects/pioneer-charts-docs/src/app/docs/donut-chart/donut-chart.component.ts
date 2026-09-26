import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { PcacDonutChart, PcacDonutChartConfig } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { StringifyPipe } from '../../stringify.pipe';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';

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
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    MatCardModule,
    RouterLink,
    PcacDonutChart,
    StringifyPipe,
    LayoutResourceState,
  ]
})
export class DonutChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    { key: 'Donut Chart', value: 'donut-chart' },
    { key: 'Try it', value: 'try-it' },
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Configuration', value: 'configuration' },
    { key: 'Events', value: 'events' },
    { key: 'Contract', value: 'contract' },
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

  configCode = `const config: PcacDonutChartConfig = {
  data: [...],
  innerRadius: 0.6,
  label: '67',
  subLabel: 'balls',
};`;

  markupCode = `<pcac-donut-chart [config]="config" (sliceClicked)="onClicked($event)" />`;
  importCode = `import { PcacDonutChart, PcacDonutChartConfig } from '@pioneer-code/pioneer-charts';`;
}
