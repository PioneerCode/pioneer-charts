import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacAxisConfig, PcacAxisSubLabels, PcacBarVerticalChartComponent, PcacLineChart } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

/** The `PcacAxisConfig` fields the demo lets you toggle; `tickSize` is the slider's. */
type AxisToggle = 'hide' | 'showGrid' | 'showLine';

@Component({
  selector: 'pc-axis-styling',
  templateUrl: './axis-styling.component.html',
  styleUrl: './axis-styling.component.scss',
  imports: [
    LayoutCode,
    LayoutPageDocs,
    LayoutResourceState,
    MatCardModule,
    PcacBarVerticalChartComponent,
    PcacLineChart,
  ]
})
export class AxisStylingComponent {
  readonly service = inject(AppService);

  /** Typed so the template's `@for` gets `'x' | 'y'` rather than `string` */
  protected readonly axes: readonly ('x' | 'y')[] = ['x', 'y'];

  /**
   * One editable `PcacAxisConfig` per axis, driving both demo charts. Tick sizes start at D3's
   * own default (6px) so the initial render matches a chart that only set the size; the lines
   * start on so there's something to see.
   */
  protected readonly xAxis = signal<PcacAxisConfig>({ ticks: 5, tickSize: 6, showLine: true, hide: false, showGrid: false, label: 'Product', subLabels: {} });
  protected readonly yAxis = signal<PcacAxisConfig>({ ticks: 5, tickSize: 6, showLine: true, hide: false, showGrid: true, label: 'Units sold', subLabels: { min: 'Low', mid: 'Medium', max: 'High' } });

  /** The three sub label slots, for the template's inputs */
  protected readonly subLabelKeys: readonly (keyof PcacAxisSubLabels)[] = ['min', 'mid', 'max'];

  /**
   * Spread into a new object rather than mutating the resource's own value, so the chart rebuilds
   * off a fresh `config` reference (see the Full Height page for the same pattern). The axes are
   * merged over the mock's own, not swapped in, so its `domainMax` (and `format`) survive.
   */
  protected readonly barConfig = computed(() => {
    const config = this.service.barVerticalChartConfig.value();
    return { ...config, xAxis: { ...config?.xAxis, ...this.xAxis() }, yAxis: { ...config?.yAxis, ...this.yAxis() } };
  });

  protected readonly lineConfig = computed(() => {
    const config = this.service.lineChartConfig.value();
    return { ...config, xAxis: { ...config?.xAxis, ...this.xAxis() }, yAxis: { ...config?.yAxis, ...this.yAxis() } };
  });

  protected onTickSize(axis: 'x' | 'y', event: Event): void {
    const tickSize = (event.target as HTMLInputElement).valueAsNumber;
    this.axisSignal(axis).update(a => ({ ...a, tickSize }));
  }

  protected onTicks(axis: 'x' | 'y', event: Event): void {
    const ticks = (event.target as HTMLInputElement).valueAsNumber;
    this.axisSignal(axis).update(a => ({ ...a, ticks }));
  }

  protected onLabel(axis: 'x' | 'y', event: Event): void {
    const label = (event.target as HTMLInputElement).value || undefined;
    this.axisSignal(axis).update(a => ({ ...a, label }));
  }

  protected onSubLabel(axis: 'x' | 'y', key: keyof PcacAxisSubLabels, event: Event): void {
    const value = (event.target as HTMLInputElement).value || undefined;
    this.axisSignal(axis).update(a => ({ ...a, subLabels: { ...a.subLabels, [key]: value } }));
  }

  protected onToggle(axis: 'x' | 'y', field: AxisToggle, event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.axisSignal(axis).update(a => ({ ...a, [field]: value }));
  }

  private axisSignal(axis: 'x' | 'y') {
    return axis === 'x' ? this.xAxis : this.yAxis;
  }

  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Axis Styling',
      value: 'axis-styling',
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

  // One PcacAxisConfig per axis. Every field is optional; leave the whole
  // object out for a default axis (labels only, 5 ticks, grid on, 0-100).
  xAxis: {
    label: 'Product', // axis title, centered below the tick labels
    tickSize: 12,     // tick mark length in px - setting it is what turns the marks on
    showLine: true    // solid line along the axis
  },
  yAxis: {
    domainMax: 1000,  // the value axis runs 0..domainMax (format: a PcacFormatEnum, e.g. Percentage)
    label: 'Units sold',
    subLabels: { min: 'Low', mid: 'Medium', max: 'High' }, // by position along the axis
    ticks: 4,         // requested tick (and grid line) count
    showGrid: false   // no horizontal grid lines
  }
} as PcacBarVerticalChartConfig;

// Grids on both axes: the x axis's is off by default on this chart, so ask for it.
const gridded = {
  data: [ ... ],
  xAxis: { showGrid: true }
} as PcacLineChartConfig;

// Or hide an axis entirely: the space it took goes back to the plot.
const sparkline = {
  data: [ ... ],
  xAxis: { hide: true },
  yAxis: { hide: true, showGrid: false }
} as PcacLineChartConfig;`;
}
