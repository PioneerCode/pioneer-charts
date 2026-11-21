import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PcacAreaChart, PcacAreaChartConfig, PcacLineChart, PcacLineChartConfig } from '@pioneer-code/pioneer-charts';

import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { ChartCard } from '../../layout/chart-card/chart-card';

/** One row of the demo table: a metric's last twelve weeks. */
interface Metric {
  name: string;
  values: number[];
  /** How the current (last) value reads in the table. */
  format: (value: number) => string;
}

/**
 * The page's sparkline config - exactly what `sparklineCode` shows. Both axes hidden, so the
 * chart's total height is `height` + 28px (see the page): 12 makes a 40px sparkline.
 */
function sparkline(name: string, values: number[]): PcacLineChartConfig {
  return {
    ...new PcacLineChartConfig(),
    height: 12,
    enableEffects: false,
    pointRadius: 0,
    xAxis: { hide: true },
    yAxis: { hide: true, showGrid: false, domainMin: Math.min(...values), domainMax: Math.max(...values) },
    data: [{
      key: name, value: null, hide: false,
      data: values.map((value, i) => ({ key: `Week ${i + 1}`, value, hide: false, data: [] })),
    }],
  };
}

@Component({
  selector: 'pc-sparkline',
  templateUrl: './sparkline.component.html',
  styleUrl: './sparkline.component.scss',
  imports: [
    ChartCard,
    LayoutCode,
    LayoutPageDocs,
    PcacAreaChart,
    PcacLineChart,
    RouterLink,
  ]
})
export class SparklineComponent {
  jumpNav = signal<IJumpNav[]>([
    { key: 'Sparklines', value: 'sparklines' },
    { key: 'In A Table', value: 'in-a-table' },
    { key: 'The Config', value: 'the-config' },
    { key: 'In A Stat Tile', value: 'in-a-stat-tile' },
    { key: 'Tips', value: 'tips' },
  ]);

  protected readonly metrics: (Metric & { config: PcacLineChartConfig })[] = [
    {
      name: 'Visitors',
      values: [1820, 1905, 1760, 2010, 2150, 2080, 2290, 2370, 2310, 2480, 2620, 2710],
      format: (v: number) => v.toLocaleString('en-US'),
    },
    {
      name: 'Sign-ups',
      values: [62, 58, 71, 66, 80, 77, 85, 79, 92, 88, 97, 104],
      format: (v: number) => v.toLocaleString('en-US'),
    },
    {
      name: 'Error rate',
      values: [1.8, 1.6, 2.1, 1.4, 1.2, 1.5, 1.1, 0.9, 1.3, 0.8, 0.7, 0.6],
      format: (v: number) => `${v}%`,
    },
  ].map((metric: Metric) => ({ ...metric, config: sparkline(metric.name, metric.values) }));

  /** The stat tile's area sparkline: the visitors again, filled, a little taller. */
  protected readonly tile: PcacAreaChartConfig = {
    ...sparkline('Visitors', this.metrics[0].values),
    height: 36,
  };

  protected last(values: number[]): number {
    return values[values.length - 1];
  }

  /** Change over the twelve weeks, as a signed percentage. */
  protected change(values: number[]): string {
    const pct = ((this.last(values) - values[0]) / values[0]) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
  }

  sparklineCode = `import { PcacLineChartConfig } from '@pioneer-code/pioneer-charts';

function sparkline(name: string, values: number[]): PcacLineChartConfig {
  return {
    ...new PcacLineChartConfig(),
    height: 12,             // plus 28px with both axes hidden: a 40px chart
    pointRadius: 0,         // just the line; a point's dot shows on hover
    enableEffects: false,   // no crosshair; each point still has its tooltip
    xAxis: { hide: true },
    yAxis: {
      hide: true,
      showGrid: false,
      // Fit the line to its own range. The default is 0 to 100.
      domainMin: Math.min(...values),
      domainMax: Math.max(...values),
    },
    data: [{
      key: name, value: null, hide: false,
      data: values.map((value, i) => ({ key: \`Week \${i + 1}\`, value, hide: false, data: [] })),
    }],
  };
}`;

  tableCode = `<table>
  @for (metric of metrics; track metric.name) {
    <tr>
      <th scope="row">{{ metric.name }}</th>
      <td><div class="spark"><pcac-line-chart [config]="metric.config" /></div></td>
      <td>{{ metric.values.at(-1) }}</td>
    </tr>
  }
</table>

/*
 * Put the chart in a fixed-width box rather than just setting a width on the cell. An auto-layout
 * table sizes each cell to its content, and the chart sizes itself to its container, so the two
 * would keep resizing each other.
 */
.spark { width: 160px; }`;

  tileCode = `<div class="tile">
  <div class="label">Visitors</div>
  <div class="value">2,710 <span class="change">+49%</span></div>
  <pcac-area-chart [config]="tile" />
</div>`;
}
