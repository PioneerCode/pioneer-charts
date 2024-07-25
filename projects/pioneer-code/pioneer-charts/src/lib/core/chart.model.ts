/**
 * Base configuration for all charts.
 *    INewChart extends IChart
 */
export interface IPcacChartConfig {
  /**
   * Height in pixels
   */
  height: number;
  data: IPcacData[];
}

export interface IPcacData {
  key: string | number;
  value: string | number;
  hide: boolean;
  data: IPcacData[];
}

export enum PcacFormatEnum {
  None = 'none',
  Percentage = 'percentage',
  Minutes = 'minutes',
  DateTime = 'dateTime',
  Fahrenheit = 'fahrenheit'
}

