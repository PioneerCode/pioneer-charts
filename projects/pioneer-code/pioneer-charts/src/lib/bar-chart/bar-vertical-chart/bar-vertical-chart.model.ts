import { PcacChartConfig, PcacData, PcacFormatEnum } from '../../core/chart.model';

export class PcacBarVerticalChartConfig extends PcacChartConfig {
  domainMax: number = 100;
  numberOfTicks: number = 5;
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  tickFormat: PcacFormatEnum = PcacFormatEnum.None
  hideGrid: boolean = false
  hideAxis: boolean = false
  spreadColorsPerGroup: boolean = false
  colorOverride: PcacBarVerticalChartColorOverrideConfig = new PcacBarVerticalChartColorOverrideConfig()
}

export class PcacBarVerticalChartColorOverrideConfig {
  colors: string[] = []
}
