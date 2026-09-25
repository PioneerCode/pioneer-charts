import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PcacPieChartComponent, PcacPieChartConfig, PcacPieDonutConfig } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { StringifyPipe } from '../../stringify.pipe';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';

@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  imports: [
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    MatCardModule,
    PcacPieChartComponent,
    StringifyPipe,
    LayoutResourceState,
  ]
})
export class PieChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Pie Chart',
      value: 'pie-chart',
    },
    {
      key: 'Donut',
      value: 'donut',
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
    },
    {
      key: 'Contract',
      value: 'contract',
    }
  ])
  /** The donut demo's live `donut` config; starts with a label so the center shows something. */
  protected readonly donut = signal<Partial<PcacPieDonutConfig>>({ innerRadius: 0.6, label: '', subLabel: 'total' });

  /** The mock's slices add up to the donut's default label, so it reads as a real total. */
  protected readonly total = computed(() =>
    (this.pcService.pieChartConfig.value().data ?? []).reduce((sum, d) => sum + Number(d.value ?? 0), 0),
  );

  /** Same pattern as the Axis Styling page: a fresh config object so the chart rebuilds. */
  protected readonly donutConfig = computed<PcacPieChartConfig>(() => {
    const donut = this.donut();
    return {
      ...this.pcService.pieChartConfig.value(),
      donut: { ...donut, label: donut.label || String(this.total()) },
    };
  });

  protected setDonut<K extends keyof PcacPieDonutConfig>(field: K, value: PcacPieDonutConfig[K]): void {
    this.donut.update((donut) => ({ ...donut, [field]: value }));
  }

  donutCode = `const config: PcacPieChartConfig = {
  ...pieConfig,
  donut: { innerRadius: 0.6, label: '67', subLabel: 'balls' },
};`;

  markupCode = `<pcac-pie-chart [config]="config" (sliceClicked)="onClicked($event)"></pcac-pie-chart>`;
  importCode = `import { PcacPieChartComponent } from '@pioneer-code/pioneer-charts';`;
}
