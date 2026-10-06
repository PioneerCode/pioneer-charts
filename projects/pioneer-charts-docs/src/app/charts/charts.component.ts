import { Component, Signal, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  PcacAreaChart,
  PcacAreaChartConfig,
  PcacBarHorizontalChart,
  PcacBarHorizontalChartConfig,
  PcacBarVerticalChart,
  PcacBarVerticalChartConfig,
  PcacData,
  PcacDonutChart,
  PcacDonutChartConfig,
  PcacDotPlotChart,
  PcacDotPlotChartConfig,
  PcacLegend,
  PcacLegendConfig,
  PcacLegendConfigItem,
  PcacLineChart,
  PcacLineChartConfig,
  PcacPieChart,
  PcacPieChartConfig,
  PcacPlotChart,
  PcacPlotChartConfig,
  PcacProximityChart,
  PcacProximityChartConfig,
} from '@pioneer-code/pioneer-charts';
import { AppService } from '../app.service';
import { LayoutResourceState } from '../layout/resource-state/resource-state';
import { ChartCard } from '../layout/chart-card/chart-card';
import { ChartLabelPipe } from './chart-label.pipe';
import { ChartContract } from '../layout/chart-contract/chart-contract';

/** The page's sections, in order, for the jump links at the top. */
const SECTIONS = [
  { id: 'bar-charts', label: 'Bar' },
  { id: 'line-area-charts', label: 'Line & Area' },
  { id: 'plot-charts', label: 'Plot' },
  { id: 'pie-donut-charts', label: 'Pie & Donut' },
  { id: 'dot-plot-charts', label: 'Dot Plot' },
  { id: 'proximity-charts', label: 'Proximity' },
  { id: 'legend', label: 'Legend' },
];

/**
 * A legend driving a chart: which of `names` are switched off, the legend's items for them, and
 * `apply`, which marks the matching entries of a chart's data hidden. A hidden entry keeps its
 * place, and so its color - which is what keeps the legend's swatches (drawn from the same palette,
 * in the same order) matching the chart.
 */
class LegendToggle {
  private readonly hidden = signal<ReadonlySet<string>>(new Set());

  readonly config: Signal<PcacLegendConfig>;

  constructor(heading: string, names: Signal<string[]>) {
    this.config = computed(() => ({
      heading,
      items: names().map((label) => ({ label, checked: !this.hidden().has(label), colorOverride: null })),
    }));
  }

  onClicked(items: PcacLegendConfigItem[]): void {
    this.hidden.set(new Set(items.filter((item) => !item.checked).map((item) => item.label)));
  }

  apply(data: PcacData[], nameOf: (entry: PcacData, index: number) => string): PcacData[] {
    return data.map((entry, index) => ({ ...entry, hide: this.hidden().has(nameOf(entry, index)) }));
  }
}

/**
 * A chart's mock at another height. The mocks were written for pages of their own and vary
 * (150-260px); the cards in a row stretch to the tallest, so a shorter chart left a gap under it.
 */
function atHeight<T extends { height: number }>(config: () => T, height: number): Signal<T> {
  return computed(() => ({ ...config(), height }));
}

/** A made-up chance of rain for the fan-out mock's cloudy and rainy readings, as on the Plot Chart page. */
const RAIN_CHANCE: Record<string, number[]> = {
  Cloudy: [0.1, 0.2, 0.3, 0.25, 0.35, 0.15],
  Rain: [0.9, 0.7, 0.8, 1, 0.6],
};

/** Names for the line mock's three unnamed series, so a legend has something to show. */
const LINE_SERIES = ['North', 'South', 'West'];

/** Category names long enough to hit the horizontal bar chart's label limit (half the chart). */
const LONG_CATEGORIES: Record<string, string> = {
  Chips: 'Sea salt and malt vinegar kettle-cooked potato chips, family-size sharing bag',
  Brownie: 'Double chocolate fudge brownie with toasted walnuts and a salted caramel swirl',
  Gum: 'Sugar-free spearmint chewing gum with long-lasting flavor, pack of fifteen',
  'Ice Cream': 'Madagascar vanilla bean ice cream made with fresh cream, one pint tub',
  Cake: 'Lemon drizzle loaf cake with a crunchy sugar glaze and candied lemon peel',
};

/**
 * A gallery of every chart type and the main features of each, drawn from the same mock data as
 * the docs pages. The examples that aren't a mock as-is are derived from one below, so each shows
 * the handful of config fields that make the difference.
 */
@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss',
  imports: [
    ChartContract,
    RouterLink,
    ChartCard,
    ChartLabelPipe,
    LayoutResourceState,
    PcacBarVerticalChart,
    PcacBarHorizontalChart,
    PcacLineChart,
    PcacAreaChart,
    PcacPlotChart,
    PcacPieChart,
    PcacDonutChart,
    PcacDotPlotChart,
    PcacProximityChart,
    PcacLegend,
  ]
})
export class ChartsComponent {
  readonly service = inject(AppService);
  readonly sections = SECTIONS;

  /**
   * The grouped bars with axis titles, tick marks, axis lines and a grid, in custom colors. Colors
   * are CSS values applied as custom properties, so the grid's can be a `light-dark()` pair and
   * follow the site's theme - its pale light-theme lavender glared on a dark card.
   */
  readonly barAxisConfig = computed<PcacBarVerticalChartConfig>(() => {
    const config = this.service.barVerticalChartGroupConfig.value();
    return {
      ...config,
      thresholds: [],
      xAxis: { ...config.xAxis, label: 'Product', tickSize: 6, showLine: true, lineColor: '#5c6bc0', tickColor: '#5c6bc0' },
      yAxis: { ...config.yAxis, label: 'Units sold', showGrid: true, tickSize: 6, showLine: true, gridColor: 'light-dark(#e8eaf6, #2f3350)' },
    };
  });

  /**
   * The single-group mocks hide their percentage axis; shown here, so the bar reads against 0-100%
   * and the gap above it (the value is 89%) explains itself.
   */
  readonly barVerticalSingleConfig = computed<PcacBarVerticalChartConfig>(() => {
    const config = this.service.barVerticalChartSingleConfig.value();
    return { ...config, yAxis: { ...config.yAxis, hide: false } };
  });

  readonly barHorizontalSingleConfig = computed<PcacBarHorizontalChartConfig>(() => {
    const config = this.service.barHorizontalChartSingleConfig.value();
    return { ...config, xAxis: { ...config.xAxis, hide: false } };
  });

  /**
   * The area chart with both axes hidden, at the same height as its neighbours - so the plot comes
   * out taller than theirs by the space the axes gave back. (The mock itself is 100px tall.)
   */
  readonly axesHiddenConfig = atHeight<PcacAreaChartConfig>(() => this.service.areaChartHideConfig.value(), 200);

  /** The plot examples at the height of the tallest, Point ranges (260px). */
  readonly plotConfig = atHeight<PcacPlotChartConfig>(() => this.service.plotConfig.value(), 260);
  readonly plotFanOutConfig = atHeight<PcacPlotChartConfig>(() => this.service.plotFanOutConfig.value(), 260);
  readonly plotImagesConfig = atHeight<PcacPlotChartConfig>(() => this.service.plotImagesConfig.value(), 260);

  /**
   * The fan-out mock split at noon and at 50 into four named quadrants: `referenceLines` and
   * `cornerLabels`, as on the Plot Chart page.
   */
  readonly plotReferenceConfig = computed<PcacPlotChartConfig>(() => ({
    ...this.plotFanOutConfig(),
    referenceLines: [
      { axis: 'x' as const, value: 12, label: 'Noon' },
      { axis: 'y' as const, value: 50, label: '50' },
    ],
    cornerLabels: { topLeft: 'Morning, high', topRight: 'Afternoon, high', bottomLeft: 'Morning, low', bottomRight: 'Afternoon, low', split: { x: 12, y: 50 } },
  }));

  /**
   * The fan-out mock with a made-up chance of rain on the cloudy and rainy readings, as a ring round
   * each (`gauge` and `pointGauge`); sunny and unknown readings get none. As on the Plot Chart page.
   */
  readonly plotGaugeConfig = computed<PcacPlotChartConfig>(() => {
    const config = this.plotFanOutConfig();
    return {
      ...config,
      data: config.data.map((series) => ({
        ...series,
        data: series.data.map((point, i) => {
          const chance = RAIN_CHANCE[series.key as string]?.[i];
          return chance === undefined ? point : { ...point, gauge: chance };
        }),
      })),
      pointGauge: { max: 1, name: 'Chance of rain' },
    };
  });

  /** June's daily highs as weather icons, values within 2° stacking together. */
  readonly dotPlotImagesConfig = computed<PcacDotPlotChartConfig>(() => ({
    ...this.service.dotPlotChartConfig.value(),
    binWidth: 2,
  }));

  /** The same highs as dots in each sky's color, only equal values stacking. */
  readonly dotPlotDotsConfig = computed<PcacDotPlotChartConfig>(() => {
    const config = this.service.dotPlotChartConfig.value();
    return {
      ...config,
      data: config.data.map((series) => ({
        ...series,
        data: series.data.map(({ image: _image, ...point }) => point),
      })),
    };
  });

  /** Cities by how alike their climate is to Portland's, named, with rings every 10%. */
  readonly proximityConfig = computed<PcacProximityChartConfig>(() => ({
    ...this.service.proximityChartConfig.value(),
    height: 300,
    showLabels: true,
    centerSize: 40,
    itemSize: 24,
  }));

  /** The same, pared back: no names, rings or spokes - the tooltip names each city. */
  readonly proximityPlainConfig = computed<PcacProximityChartConfig>(() => ({
    ...this.service.proximityChartConfig.value(),
    height: 300,
    rings: [],
    showSpokes: false,
    centerSize: 36,
    itemSize: 22,
  }));

  /** The horizontal bars with category names too long for the chart: shortened with "…" to fit. */
  readonly barLongLabelsConfig = computed<PcacBarHorizontalChartConfig>(() => {
    const config = this.service.barHorizontalChartConfig.value();
    return {
      ...config,
      data: (config.data ?? []).map((group) => ({ ...group, key: LONG_CATEGORIES[String(group.key)] ?? group.key })),
    };
  });

  /** The line chart shrunk to a sparkline: no axes, no grid, no hover effects. */
  readonly sparklineConfig = computed<PcacLineChartConfig>(() => {
    const config = this.service.lineChartConfig.value();
    // Spread over the mock's own axes, so the y domain (and so the scale of the line) stays theirs.
    return {
      ...config,
      height: 80,
      enableEffects: false,
      xAxis: { ...config.xAxis, hide: true },
      yAxis: { ...config.yAxis, hide: true, showGrid: false },
    };
  });

  private readonly pieTotal = computed(() =>
    (this.service.pieChartConfig.value().data ?? []).reduce((sum, d) => sum + Number(d.value ?? 0), 0),
  );

  /** The pie's slices as a donut, with their total in the center. */
  readonly donutTotalConfig = computed<PcacDonutChartConfig>(() => ({
    ...this.service.pieChartConfig.value(),
    label: String(this.pieTotal()),
    subLabel: 'total',
  }));

  /** A thin ring in the page's own colors. */
  readonly donutThinConfig = computed<PcacDonutChartConfig>(() => ({
    ...this.service.pieChartConfig.value(),
    innerRadius: 0.8,
    label: 'Snacks',
    colorOverride: ['#3949ab', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9'],
  }));

  /** A legend switching the pie's slices on and off. */
  readonly pieLegend = new LegendToggle('Snacks', computed(() =>
    (this.service.pieChartConfig.value().data ?? []).map((slice) => String(slice.key))));

  readonly legendPieConfig = computed<PcacPieChartConfig>(() => {
    const config = this.service.pieChartConfig.value();
    return { ...config, data: this.pieLegend.apply(config.data ?? [], (slice) => String(slice.key)) };
  });

  /** A legend switching the line chart's series on and off. */
  readonly lineLegend = new LegendToggle('Region', signal(LINE_SERIES));

  readonly legendLineConfig = computed<PcacLineChartConfig>(() => {
    const config = this.service.lineChartConfig.value();
    const named = (config.data ?? []).map((series, i) => ({ ...series, key: LINE_SERIES[i] ?? series.key }));
    return { ...config, data: this.lineLegend.apply(named, (_, i) => LINE_SERIES[i]) };
  });

}
