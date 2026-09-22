import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { color } from 'd3-color';
import { RouterLink } from '@angular/router';
import { PcacAxisConfig, PcacAxisSubLabels, PcacBarVerticalChartComponent, PcacLineChart } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

/** The `PcacAxisConfig` fields the demo lets you toggle; `tickSize` is the slider's. */
type AxisToggle = 'hide' | 'showGrid' | 'showLine';

/** The `PcacAxisConfig` color fields, each with its own picker. */
type AxisColor = 'labelColor' | 'subLabelColor' | 'tickLabelColor' | 'tickColor' | 'lineColor' | 'gridColor';

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
    RouterLink,
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
   * The color fields, each with the part's default color (the theme's `$gray-*`; for tick labels
   * the page's text color) so an unset picker shows what the chart is actually drawing.
   */
  protected readonly colorFields: readonly { field: AxisColor; theme: string }[] = [
    { field: 'labelColor', theme: '#495057' },
    { field: 'subLabelColor', theme: '#6c757d' },
    { field: 'tickLabelColor', theme: bodyTextColorHex() },
    { field: 'tickColor', theme: '#212529' },
    { field: 'lineColor', theme: '#212529' },
    { field: 'gridColor', theme: '#e9ecef' },
  ];

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

  protected onColor(axis: 'x' | 'y', field: AxisColor, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.axisSignal(axis).update(a => ({ ...a, [field]: value }));
  }

  /** Back to unset, i.e. the theme's color - a color input has no empty state of its own. */
  protected onClearColor(axis: 'x' | 'y', field: AxisColor): void {
    this.axisSignal(axis).update(a => ({ ...a, [field]: undefined }));
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
      key: 'Colors',
      value: 'colors',
    },
    {
      key: 'Notes',
      value: 'notes',
    }
  ]);

  colorConfigCode = `const config = {
  data: [ ... ],
  xAxis: {
    showLine: true,
    lineColor: '#0d6efd',   // blue axis line
    tickSize: 6,
    tickColor: '#0d6efd',   // blue tick marks
    tickLabelColor: '#495057'
  },
  yAxis: {
    label: 'Units sold',
    labelColor: '#0d6efd',
    gridColor: '#cfe2ff'    // pale blue grid; the y axis's grid is on by default
  }
} as PcacBarVerticalChartConfig;`;

  colorCssCode = `/* Every chart inside .dark-panel */
.dark-panel {
  --pcac-axis-label-color: #dee2e6;
  --pcac-axis-sub-label-color: #adb5bd;
  --pcac-axis-tick-label-color: #dee2e6;
  --pcac-axis-tick-color: #adb5bd;
  --pcac-axis-line-color: #adb5bd;
  --pcac-grid-color: #495057;
}`;

  configCode = `const config = {
  data: [ ... ],

  // One PcacAxisConfig per axis. Every field is optional; leave the whole
  // object out for a default axis (labels only, 5 ticks, grid on, 0-100).
  xAxis: {
    label: 'Product', // axis title, centered below the tick labels
    tickSize: 12,     // tick mark length in px - setting it is what turns the marks on
    showLine: true,   // solid line along the axis
    lineColor: '#0d6efd' // its color (see Colors below)
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

/** The page's text color as `#rrggbb`, the only form a color input accepts; black if it can't be read. */
function bodyTextColorHex(): string {
  return color(getComputedStyle(document.body).color)?.formatHex() ?? '#000000';
}
