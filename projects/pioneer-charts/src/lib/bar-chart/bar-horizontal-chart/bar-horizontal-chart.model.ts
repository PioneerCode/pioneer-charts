import { PcacAxisChartConfig, PcacData } from '../../core/chart.model';

export class PcacBarHorizontalChartConfig extends PcacAxisChartConfig {
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  spreadColorsPerGroup: boolean = false
  /**
   * Bar colors, any CSS color, in place of the theme palette - by series, or by group with
   * `spreadColorsPerGroup`. Repeated when there are more series (or groups) than colors. Empty,
   * the theme palette is used.
   */
  colorOverride: string[] = []
}
