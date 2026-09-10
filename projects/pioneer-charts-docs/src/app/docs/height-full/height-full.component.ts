import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacBarVerticalChartComponent, PcacLineChart } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-height-full',
  templateUrl: './height-full.component.html',
  styleUrl: './height-full.component.scss',
  imports: [
    LayoutCode,
    LayoutPageDocs,
    LayoutResourceState,
    MatCardModule,
    PcacBarVerticalChartComponent,
    PcacLineChart,
  ]
})
export class HeightFullComponent {
  readonly service = inject(AppService);

  /**
   * Drives the height of the demo containers below. Dragging it is the point of the page: the
   * `heightFull` charts follow the container as it resizes, the fixed-height one doesn't.
   */
  protected readonly containerHeight = signal(360);

  /**
   * Both demo charts share the Bar Chart page's mock config (`height: 200`) and differ only in
   * `heightFull`, so the two panels are a like-for-like comparison.
   *
   * Spread into a new object rather than mutating the resource's own value: the chart components
   * rebuild off a new `config` reference, and mutating the shared config would flip the other
   * panel too.
   */
  protected readonly fixedConfig = computed(() => ({
    ...this.service.barVerticalChartConfig.value(),
    heightFull: false
  }));

  protected readonly fullConfig = computed(() => ({
    ...this.service.barVerticalChartConfig.value(),
    heightFull: true
  }));

  protected readonly lineFullConfig = computed(() => ({
    ...this.service.lineChartConfig.value(),
    heightFull: true
  }));

  protected onContainerHeight(event: Event): void {
    this.containerHeight.set((event.target as HTMLInputElement).valueAsNumber);
  }

  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Full Height',
      value: 'height-full',
    },
    {
      key: 'Try It',
      value: 'try-it',
    },
    {
      key: 'Fill A Flex Layout',
      value: 'flex-layout',
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

  markupCode = `<!-- The wrapper owns the height; the chart fills it. -->
<div style="height: 360px">
  <pcac-bar-vertical-chart [config]="config" />
</div>`;

  configCode = `const config = {
  data: [ ... ],

  // Minimum height. Used as-is whenever the container is shorter than this.
  height: 200,

  // Grow past 'height' to fill the container whenever it is taller.
  heightFull: true
} as PcacBarVerticalChartConfig;`;

  flexCode = `<!-- A dashboard tile: the header takes what it needs, the chart takes the rest. -->
<mat-card class="flex flex-col" style="height: 360px">
  <h5>Requests per minute</h5>
  <p>Last 24 hours</p>

  <div class="flex-1 min-h-0">
    <pcac-line-chart [config]="config" />
  </div>
</mat-card>`;
}
