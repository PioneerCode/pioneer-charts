import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacBarVerticalChartComponent, PcacLineChart } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-tick-size',
  templateUrl: './tick-size.component.html',
  styleUrl: './tick-size.component.scss',
  imports: [
    LayoutCode,
    LayoutPageDocs,
    LayoutResourceState,
    MatCardModule,
    PcacBarVerticalChartComponent,
    PcacLineChart,
  ]
})
export class TickSizeComponent {
  readonly service = inject(AppService);

  /**
   * Drive the two demo charts below. Both start at D3's own default (6px) so the initial render
   * matches what a consumer gets without setting anything.
   */
  protected readonly xTickSize = signal(6);
  protected readonly yTickSize = signal(6);

  /**
   * Spread into a new object rather than mutating the resource's own value, so the chart rebuilds
   * off a fresh `config` reference (see the Full Height page for the same pattern).
   */
  protected readonly barConfig = computed(() => ({
    ...this.service.barVerticalChartConfig.value(),
    xTickSize: this.xTickSize(),
    yTickSize: this.yTickSize()
  }));

  protected readonly lineConfig = computed(() => ({
    ...this.service.lineChartConfig.value(),
    xTickSize: this.xTickSize(),
    yTickSize: this.yTickSize()
  }));

  protected onXTickSize(event: Event): void {
    this.xTickSize.set((event.target as HTMLInputElement).valueAsNumber);
  }

  protected onYTickSize(event: Event): void {
    this.yTickSize.set((event.target as HTMLInputElement).valueAsNumber);
  }

  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Tick Size',
      value: 'tick-size',
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
      key: 'Notes',
      value: 'notes',
    }
  ]);

  configCode = `const config = {
  data: [ ... ],

  // Length in pixels of the tick marks on each axis. Setting one turns that axis's marks on;
  // an axis you leave out draws none, as before.
  xTickSize: 12,
  yTickSize: 6
} as PcacBarVerticalChartConfig;`;
}
