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

  /**
   * When true, `height` becomes a *minimum* height: if the container the chart is placed in is
   * taller than `height`, the chart grows to fill it instead.
   *
   * The chart fills its own host element (`<pcac-bar-vertical-chart>` etc.), which it stretches
   * to `height: 100%` while this is on - so the consumer just needs to give the element wrapping
   * the chart a definite height (an explicit height, or a flex/grid track that resolves to one).
   * If that wrapper turns out to be auto-height, there's nothing definite to fill and the chart
   * falls back to `height`.
   *
   * Optional (rather than defaulted like the properties above) so that adding it doesn't force
   * every existing consumer that builds a config as an object literal to declare it; the `= false`
   * initializer still applies to anything constructed via `new`.
   */
  heightFull?: boolean = false
}

export class PcacData {
  key: string | number | null = null
  value: string | number| null = null
  hide: boolean = false
  data: PcacData[] = []
}

export enum PcacFormatEnum {
  None = 'none',
  Decimal = 'decimal',
  DatasetLength = 'datasetLength',
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

