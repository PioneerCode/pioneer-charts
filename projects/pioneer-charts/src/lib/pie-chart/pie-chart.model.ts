import { PcacChartConfig } from '../core/chart.model';

/**
 * Turns the pie into a donut: slices drawn as a ring around an empty center, which can hold a
 * short label - typically the total the slices add up to.
 */
export class PcacPieDonutConfig {
  /**
   * Radius of the hole as a fraction of the pie's radius, from 0 (a plain pie) to 0.9. Values
   * outside that range are clamped.
   */
  innerRadius: number = 0.6

  /**
   * Large text centered in the hole, e.g. `'67'`. Sized to the hole and shrunk to fit across it;
   * left out if it would have to go below 8px. Not drawn when not set.
   */
  label?: string

  /** Smaller line under `label`, e.g. `'balls'`, fitted the same way. Not drawn when not set. */
  subLabel?: string

  /**
   * `label` color, any CSS color; theme default `$gray-800`. Applied as
   * `--pcac-pie-center-label-color` on the chart's `.pcac-pie-center` group, so a stylesheet can
   * set it on an ancestor instead (a config value wins).
   */
  labelColor?: string

  /** `subLabel` color, likewise (`--pcac-pie-center-sub-label-color`); theme default `$gray-600`. */
  subLabelColor?: string
}

export class PcacPieChartConfig extends PcacChartConfig {
  /**
   * Draw the pie as a donut. Off when not set; `{}` turns it on with every `PcacPieDonutConfig`
   * default. Slices, hover and `sliceClicked` behave the same either way.
   */
  donut?: Partial<PcacPieDonutConfig>
}
