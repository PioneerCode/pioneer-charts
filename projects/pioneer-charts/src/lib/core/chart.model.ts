/**
 * Base configuration for all charts.
 *    INewChart extends IChart
 */
export class PcacChartConfig {
  /**
   * Height in pixels
   */
  data: PcacData[] = []
  height: number = 200
}

export class PcacData {
  key: string | number | null = null
  value: string | number| null = null
  hide: boolean = false
  data: PcacData[] = []
}

export enum PcacFormatEnum {
  None = 'none',
  Percentage = 'percentage',
  Minutes = 'minutes',
  DateTime = 'dateTime',
  Fahrenheit = 'fahrenheit'
}

