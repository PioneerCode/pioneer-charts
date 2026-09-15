import { PcacAxisChartConfig, PcacData } from '../../core/chart.model';

export class PcacBarVerticalChartConfig extends PcacAxisChartConfig {
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  spreadColorsPerGroup: boolean = false
  colorOverride: PcacBarVerticalChartColorOverrideConfig = new PcacBarVerticalChartColorOverrideConfig()
}

export class PcacBarVerticalChartColorOverrideConfig {
  colors: string[] = []
}
