import { PcacChartConfig, PcacData, PcacFormatEnum } from '../../core/chart.model';

export class PcacBarVerticalChartConfig extends PcacChartConfig {
  domainMax: number = 100;
  numberOfTicks: number = 5;
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  tickFormat: PcacFormatEnum = PcacFormatEnum.None
  hideGrid: boolean = false
  hideAxis: boolean = false

  /**
   * Length in pixels of the small tick marks along the x / y axis. Tick marks are not drawn at
   * all unless one of these is set (the theme hides them, as it always has), so setting a size is
   * also what turns them on for that axis; D3's default 6px is a sensible first value. `0` keeps
   * them off but still pulls the labels in to the axis. Tick labels follow the marks (D3 places
   * them at tick length + 3px), and the chart's margins grow or shrink by the same amount so the
   * plot area makes room for them - a longer tick means a slightly smaller plot, never labels
   * pushed off the edge. Only the per-tick marks change - the axis line's two end-caps keep their
   * default length. Color comes from the theme (`.pcac-axis-tick-marks .tick line`).
   *
   * Optional (rather than defaulted) for the same reason as `PcacChartConfig.heightFull`: so
   * existing object-literal / JSON configs don't have to declare them.
   */
  xTickSize?: number
  yTickSize?: number
  spreadColorsPerGroup: boolean = false
  colorOverride: PcacBarVerticalChartColorOverrideConfig = new PcacBarVerticalChartColorOverrideConfig()
}

export class PcacBarVerticalChartColorOverrideConfig {
  colors: string[] = []
}
