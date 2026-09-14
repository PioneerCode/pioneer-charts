import { PcacAxisChartConfig, PcacData, PcacFormatEnum } from '../../core/chart.model';

export class PcacBarHorizontalChartConfig extends PcacAxisChartConfig {
  domainMax: number = 100;
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  tickFormat: PcacFormatEnum = PcacFormatEnum.None
  spreadColorsPerGroup: boolean = false
  colorOverride: PcacBarHorizontalChartColorOverrideConfig = new PcacBarHorizontalChartColorOverrideConfig()
}

export class PcacBarHorizontalChartColorOverrideConfig {
  colors: string[] = []
}
