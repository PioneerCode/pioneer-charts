import { PcacChartConfig } from '../core/chart.model';

/** One state a period can be in, such as OK or Error: its key, its name and its color. */
export class PcacStateTimelineState {
  /** The state's key, matching the keys in a period's `data`. */
  key = ''

  /** The state's name in the tooltip and for screen readers. Defaults to its `key`. */
  label?: string

  /**
   * Any CSS color. Defaults to the theme: pale green for the first state, strong red for the last,
   * and amber for any in between. Choose colors that differ in lightness so people with color
   * blindness can tell them apart.
   */
  color?: string
}

/**
 * A state timeline shows how something's status changed over time. Each row is one thing you're
 * tracking, like a service or a device, split into periods such as days or hours. Each period is
 * colored by the worst state it reached, so one hour of Error in an otherwise good day still shows.
 *
 * `data` is a list of rows. A row's `key` is its name, shown to its left unless `rowLabels` is
 * false, and its `data` is its periods, oldest first. Each period has:
 * - `key`: its name, shown in the tooltip and read by screen readers (`'Fri, Nov 20'`).
 * - `value`: how long it is, in any unit. Leave it out and the length is the total of its states.
 * - `data`: how much time it spent in each state, in the same unit, keyed by the state's `key`.
 *
 * Any time not covered by a state is unknown: a partly unknown period is striped, and an entirely
 * unknown one is plain gray. The color is lighter when the worst state lasted a short time and
 * full strength when it lasted the whole period. Every period in a row is the same width. A row
 * or period with `hide` set is left out.
 */
export class PcacStateTimelineConfig extends PcacChartConfig {
  /**
   * Height in pixels, split evenly between the rows with 4px between them. Default 24, which fits
   * one row; set a larger height for more rows.
   */
  override height: number = 24

  /** The states a period can be in, from least to most severe. Each period shows its worst. */
  states: PcacStateTimelineState[] = []

  /**
   * Space between periods, in px. Default 2. It shrinks to 1px, then to none, when periods get
   * too narrow.
   */
  gap?: number = 2

  /** Show each row's name to its left. Default true. */
  rowLabels?: boolean = true
}
