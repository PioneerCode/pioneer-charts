import { PcacChartConfig, PcacData, PcacFormatEnum } from '../../core/chart.model';

export class PcacBarHorizontalChartConfig extends PcacChartConfig {
  domainMax: number = 100;
  numberOfTicks: number = 5;
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  tickFormat: PcacFormatEnum = PcacFormatEnum.None
  hideGrid: boolean = false
  hideAxis: boolean = false
  spreadColorsPerGroup: boolean = false
  colorOverride: PcacBarHorizontalChartColorOverrideConfig = new PcacBarHorizontalChartColorOverrideConfig()
}

export class PcacBarHorizontalChartColorOverrideConfig {
  colors: string[] = []
}
