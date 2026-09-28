import { PcacChartConfig, PcacData, PcacFormatEnum } from '../core/chart.model';

/**
 * A proximity chart: one item in the middle (`center`) and others (`data`) around it, each placed
 * closer in or further out by its `value` - how similar it is to the center, say, or how far from
 * it. It answers "what's nearest to this?" at a glance: the closest matches sit tight around the
 * center, weaker ones out on the rim.
 *
 * Each item in `data` is one point: `key` is its name (tooltip, screen readers), `value` its
 * closeness in whatever units the chart's `closeValue` / `farValue` use, and `image` optionally
 * drawn in place of its dot. Items go around the center clockwise from `startAngle` in data order,
 * evenly spaced, so put the closest first to have it at the top. An item whose `value` isn't a
 * number, or with `hide`, is left out. Best with a handful to a dozen or so items; past that they
 * crowd one another around the ring.
 */
export class PcacProximityChartConfig extends PcacChartConfig {
  /** The item the others are measured against, drawn in the middle. Its `value` isn't used. */
  center: PcacData = new PcacData()

  /**
   * The `value` that sits right up against the center, and the one that sits on the outer rim;
   * values in between are placed proportionally, and anything beyond either is held at it.
   * The defaults suit a similarity from 0 to 1 (1 = identical, closest in). For a distance, swap
   * them: `closeValue: 0, farValue: <largest distance>`.
   */
  closeValue?: number = 1
  farValue?: number = 0

  /**
   * Values to draw a faint guide ring at, each labelled in `format` - e.g. `[0.95, 0.9, 0.85]` with
   * `Percentage` reads "95%", "90%", "85%". None when not set.
   */
  rings?: number[]

  /** How values read on the ring labels, in the tooltip and to screen readers; see `PcacFormatEnum`. */
  format?: PcacFormatEnum

  /**
   * Write each item's `key` under it, and the center's under the center. Default false: names are
   * in the tooltip either way. Keep it off for long names or a crowded ring.
   */
  showLabels?: boolean = false

  /** Draw a faint line from the center to each item. Default true. */
  showSpokes?: boolean = true

  /** Where the first item sits, in degrees clockwise from 12 o'clock. Default 0. */
  startAngle?: number = 0

  /** Size of the center item's image (or twice its dot's radius), in px. Default 64. */
  centerSize?: number = 64

  /** Size of each surrounding item's image (or twice its dot's radius), in px. Default 40. */
  itemSize?: number = 40

  /**
   * Item colors, any CSS color, used in data order for the dots of items without an `image` (the
   * center takes the first). Repeated when there are more items than colors. Omitted or empty, the
   * theme palette is used.
   */
  colorOverride?: string[]
}
