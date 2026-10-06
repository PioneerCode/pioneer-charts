import { Component, computed, inject, signal, DOCUMENT } from '@angular/core';
import { color } from 'd3-color';
import { RouterLink } from '@angular/router';
import { PcacAxisConfig, PcacAxisSubLabels, PcacBarVerticalChart, PcacLineChart } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';
import { ThemeService } from '../../layout/theme.service';

/** The `PcacAxisConfig` fields the demo lets you toggle; `tickSize` is the slider's. */
type AxisToggle = 'hide' | 'showGrid' | 'showLine';

/** The `PcacAxisConfig` color fields, each with its own picker. */
type AxisColor = 'labelColor' | 'subLabelColor' | 'tickLabelColor' | 'tickColor' | 'lineColor' | 'gridColor';

@Component({
  selector: 'pc-axis-styling',
  templateUrl: './axis-styling.component.html',
  styleUrl: './axis-styling.component.scss',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutPageDocs,
    LayoutResourceState,
    PcacBarVerticalChart,
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

  private readonly theme = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  /**
   * The color fields, each with the part's default color so an unset picker shows what the chart is
   * actually drawing: the library theme's `$gray-*` on the light theme, the lighter grays the site's
   * dark theme sets instead (styles.scss) on the dark one, and for tick labels the page's text
   * color. Worked out again when the theme is switched.
   */
  protected readonly colorFields = computed<readonly { field: AxisColor; theme: string }[]>(() => {
    const dark = this.theme.dark();
    return [
      { field: 'labelColor', theme: dark ? '#dee2e6' : '#495057' },
      { field: 'subLabelColor', theme: dark ? '#adb5bd' : '#6c757d' },
      { field: 'tickLabelColor', theme: bodyTextColorHex(this.document) },
      { field: 'tickColor', theme: dark ? '#adb5bd' : '#212529' },
      { field: 'lineColor', theme: dark ? '#adb5bd' : '#212529' },
      { field: 'gridColor', theme: dark ? '#3a3f46' : '#e9ecef' },
    ];
  });

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
    subLabels: { min: 'Low', mid: 'Medium', max: 'High' }, // at the axis's start, middle and end
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

/**
 * The page's text color as `#rrggbb`, the only form a color input accepts; black if it can't be
 * read - as when the page is pre-rendered at build time, where there are no computed styles.
 */
function bodyTextColorHex(document: Document): string {
  const view = document.defaultView;
  const text = typeof view?.getComputedStyle === 'function' ? view.getComputedStyle(document.body).color : '';
  return color(text)?.formatHex() ?? '#000000';
}
