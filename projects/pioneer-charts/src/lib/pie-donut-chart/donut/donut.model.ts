import { PcacPieDonutChartConfig } from '../pie-donut-chart.model';

/**
 * A pie with its slices drawn as a ring around an empty center, which can hold a short label -
 * typically the total the slices add up to.
 */
export class PcacDonutChartConfig extends PcacPieDonutChartConfig {
  /**
   * Radius of the hole as a fraction of the chart's radius, from 0 (no hole - a pie) to 0.9.
   * Values outside that range are clamped.
   */
  innerRadius?: number = 0.6

  /**
   * Large text centered in the hole, e.g. `'67'`. Sized to the hole and shrunk to fit across it;
   * left out if it would have to go below 8px. Not drawn when not set.
   */
  label?: string

  /** Smaller line under `label`, e.g. `'balls'`, fitted the same way. Not drawn when not set. */
  subLabel?: string

  /**
   * `label` color, any CSS color; theme default `$gray-800`. Applied as
   * `--pcac-donut-center-label-color` on the chart's `.pcac-donut-center` group, so a stylesheet
   * can set it on an ancestor instead (a config value wins).
   */
  labelColor?: string

  /** `subLabel` color, likewise (`--pcac-donut-center-sub-label-color`); theme default `$gray-600`. */
  subLabelColor?: string
}
