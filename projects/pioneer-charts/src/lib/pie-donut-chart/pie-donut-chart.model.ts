import { PcacChartConfig } from '../core/chart.model';

/** Which chart the shared `<pcac-pie-donut-chart>` draws; each wrapper binds its own. */
export enum PcacPieDonutChartType {
  Pie = 'pie',
  Donut = 'donut'
}

/**
 * What the pie and donut charts share. Internal: consumers configure `PcacPieChartConfig` or
 * `PcacDonutChartConfig`, the same way the line, area and plot charts share
 * `PcacLineAreaChartConfig`.
 */
export class PcacPieDonutChartConfig extends PcacChartConfig {
  /**
   * Slice colors, any CSS color, in data order - the first slice takes the first color - in place
   * of the theme palette. Repeated when there are more slices than colors. Omitted or empty, the
   * theme palette is used. Match a `<pcac-legend>` to it with each item's `colorOverride`.
   */
  colorOverride?: string[]
}
