/**
 * Base configuration for all charts.
 *    INewChart extends IChart
 */
export interface IChart {
  /**
   * Height in px
   */
  height: number;
  data: IData[];
}

export interface IData {
  key: string | number;
  value: string | number;
  data: IData[];
}
