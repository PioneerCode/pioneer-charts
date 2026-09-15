import { PcacAxisChartConfig, PcacData } from '../../core/chart.model';

export class PcacBarHorizontalChartConfig extends PcacAxisChartConfig {
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  spreadColorsPerGroup: boolean = false
  colorOverride: PcacBarHorizontalChartColorOverrideConfig = new PcacBarHorizontalChartColorOverrideConfig()
}

export class PcacBarHorizontalChartColorOverrideConfig {
  colors: string[] = []
}
