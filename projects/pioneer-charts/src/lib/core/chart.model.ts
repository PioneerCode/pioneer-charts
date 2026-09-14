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

/**
 * Up to three short labels placed along an axis by position rather than by value: `min` at its
 * start, `mid` at its center, `max` at its end. Any subset can be given.
 */
export class PcacAxisSubLabels {
  min?: string
  mid?: string
  max?: string
}

/**
 * Everything configurable about one axis. Used twice per chart, as `xAxis` and `yAxis` on
 * `PcacAxisChartConfig`, so the two never drift apart and a new per-axis option lands in one place.
 *
 * Every field is optional so an object-literal / JSON config can give just the ones it cares
 * about (or omit the axis entirely); the initializers apply to anything built with `new`, and
 * `resolveAxisConfig()` fills the rest in for builders.
 */
export class PcacAxisConfig {
  /**
   * Don't draw this axis at all (labels, tick marks, line), and give the margins it would have
   * occupied back to the plot area. Hiding the y axis reclaims the left and top margins; hiding
   * the x axis reclaims the bottom and right. The chart's total footprint doesn't change.
   */
  hide?: boolean = false

  /**
   * Draw grid lines from this axis's ticks (or, on a category axis, from each category) across
   * the plot: horizontal lines for the y axis, vertical for the x. Left unset, each chart keeps
   * the grid it has always drawn - the y axis's on vertical bar and line/area/plot charts, the
   * x axis's on the horizontal bar chart - and no other; set it to turn either grid on or off
   * explicitly. Deliberately has no initializer, since "unset" is what carries the per-chart
   * default.
   */
  showGrid?: boolean

  /**
   * Requested number of ticks (D3's `ticks()` hint, so the actual count can differ slightly) -
   * also the number of grid lines for this axis. Ignored by a category (band) axis, which has one
   * tick per category. Default 5.
   */
  ticks?: number = 5

  /**
   * Length in pixels of the small tick marks. Tick marks are not drawn at all unless this is set
   * (the theme hides them, as it always has), so setting a size is also what turns them on; D3's
   * default 6px is a sensible first value. `0` keeps them off but still pulls the labels in to
   * the axis. Labels follow the marks (D3 places them at tick length + 3px), and the chart's
   * margins grow or shrink by the same amount so the plot area makes room for them - a longer
   * tick means a slightly smaller plot, never labels pushed off the edge. Only the per-tick marks
   * change; the axis line's two end-caps keep their default length. Color comes from the theme
   * (`.pcac-axis-tick-marks .tick line`, `$gray-900`, the same as the axis line).
   */
  tickSize?: number

  /**
   * Draw a solid line along the axis itself (the full length of the axis, with D3's short
   * end-caps). Off by default, as the theme has always hidden it. Color comes from the theme
   * (`.pcac-axis-line .domain`, `$gray-900`).
   */
  showLine?: boolean = false

  /**
   * A title for the whole axis (e.g. "Revenue ($)"), drawn centered along it just inside the
   * chart's edge: below the tick labels for the x axis, rotated to read bottom-to-top left of
   * them for the y axis. The chart's margin grows by `PcacChart.AXIS_LABEL_SPACE` to make room,
   * shrinking the plot area the same way a longer tick does. Not drawn on a hidden axis. Styled
   * by the theme's `.pcac-axis-label` rule.
   */
  label?: string

  /**
   * Min / mid / max sub labels (e.g. "Low" / "Medium" / "High") in their own row just outside the
   * tick labels, and inside the `label` if there is one: `min` left-aligned at the axis's start,
   * `mid` centered, `max` right-aligned at its end, so they never spill past the axis. On the
   * y axis they run bottom-to-top like the label, `min` at the bottom. The margin grows by
   * `PcacChart.AXIS_SUB_LABEL_SPACE` when any is set, shrinking the plot area. Not drawn on a
   * hidden axis. Styled by the theme's `.pcac-axis-sub-label` rule.
   */
  subLabels?: PcacAxisSubLabels
}

/**
 * The `PcacChartMargin` type lives here rather than in chart.ts so the axis builder can take
 * one without importing the class module that imports it back.
 */
export interface PcacChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * `PcacAxisConfig` with every default applied - what builders work with, so they never have to
 * null-check. `tickSize`, `label` and `subLabels` stay optional: "not set" is itself the meaningful
 * default (no marks, no labels).
 */
export type PcacResolvedAxisConfig = Required<Omit<PcacAxisConfig, 'tickSize' | 'label' | 'subLabels'>> & Pick<PcacAxisConfig, 'tickSize' | 'label' | 'subLabels'>;

/** True if `axis` has at least one sub label to draw (an empty `subLabels` object counts as none). */
export function hasAxisSubLabels(axis: PcacAxisConfig | undefined): boolean {
  const sub = axis?.subLabels;
  return !!sub && (!!sub.min || !!sub.mid || !!sub.max);
}

/**
 * Room reserved in a margin for an axis `label`: the theme's 12px label plus a gap from the tick
 * labels. Reserved on the side the label sits on (`bottom` for x, `left` for y), and taken out
 * of the plot area, the same way a longer tick is. Change together with `.pcac-axis-label`.
 */
export const PCAC_AXIS_LABEL_SPACE = 18;

/** Likewise for a row of `subLabels`: the theme's 11px text plus a gap (`.pcac-axis-sub-label`). */
export const PCAC_AXIS_SUB_LABEL_SPACE = 16;

/**
 * Total margin an axis's `label` and `subLabels` take on its side. `PcacChart` reserves it and
 * the axis builder places the text by it, so the two stay in step.
 */
export function axisLabelSpace(axis: PcacAxisConfig | undefined): number {
  return (axis?.label ? PCAC_AXIS_LABEL_SPACE : 0) + (hasAxisSubLabels(axis) ? PCAC_AXIS_SUB_LABEL_SPACE : 0);
}

/**
 * @param showGridDefault what `showGrid` resolves to when the consumer left it unset - each chart
 * passes `true` for the axis whose grid it has always drawn and `false` for the other.
 */
export function resolveAxisConfig(axis?: PcacAxisConfig, showGridDefault = false): PcacResolvedAxisConfig {
  const defaults = new PcacAxisConfig();
  return {
    hide: axis?.hide ?? defaults.hide!,
    showGrid: axis?.showGrid ?? showGridDefault,
    ticks: axis?.ticks ?? defaults.ticks!,
    tickSize: axis?.tickSize,
    showLine: axis?.showLine ?? defaults.showLine!,
    label: axis?.label,
    subLabels: axis?.subLabels,
  };
}

/**
 * Base configuration for every chart that has an x and y axis (bar, line, area, plot - not pie).
 */
export class PcacAxisChartConfig extends PcacChartConfig {
  xAxis?: PcacAxisConfig = new PcacAxisConfig()
  yAxis?: PcacAxisConfig = new PcacAxisConfig()
}

export class PcacData {
  key: string | number | null = null
  value: string | number| null = null
  hide: boolean = false
  data: PcacData[] = []

  /**
   * URL (or data URI) of an image to draw at this point *in place of* its dot. Currently honored
   * by the line/area/plot charts only, on the innermost (point-level) `PcacData`; sized by the
   * chart config's `pointImage` (see `PcacLineAreaChartConfig.pointImage`). Points without one
   * keep their regular dot, so the two can be mixed within a single series.
   *
   * Optional (rather than defaulted) for the same reason as `PcacChartConfig.heightFull`: so
   * existing object-literal / JSON data doesn't have to declare it.
   */
  image?: string
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

