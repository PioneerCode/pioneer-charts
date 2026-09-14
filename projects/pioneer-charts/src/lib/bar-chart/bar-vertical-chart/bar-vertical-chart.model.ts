import { PcacAxisChartConfig, PcacData, PcacFormatEnum } from '../../core/chart.model';

export class PcacBarVerticalChartConfig extends PcacAxisChartConfig {
  domainMax: number = 100;
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  tickFormat: PcacFormatEnum = PcacFormatEnum.None
  spreadColorsPerGroup: boolean = false
  colorOverride: PcacBarVerticalChartColorOverrideConfig = new PcacBarVerticalChartColorOverrideConfig()
}

export class PcacBarVerticalChartColorOverrideConfig {
  colors: string[] = []
}
