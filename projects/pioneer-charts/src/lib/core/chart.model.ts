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
  Fahrenheit = 'fahrenheit',

  /**
   * Expectation is we will be given a range of data from 0-23
   * and we will map that to a 12 hour clock with am/pm
   * e.g. 0 = 12am, 1 = 1am, 13 = 1pm, 23 = 11pm
   */
  OneDayHours = 'oneDayHours'
}

