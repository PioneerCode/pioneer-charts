import { PcacChartConfig } from '../core/chart.model';

export class PcacPieChartConfig extends PcacChartConfig {
  /**
   * Slice colors, any CSS color, in data order - the first slice takes the first color - in place
   * of the theme palette. Repeated when there are more slices than colors. Omitted or empty, the
   * theme palette is used. Match a `<pcac-legend>` to it with each item's `colorOverride`.
   */
  colorOverride?: string[]
}
