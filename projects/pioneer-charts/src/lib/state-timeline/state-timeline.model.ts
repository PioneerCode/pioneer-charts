import { PcacChartConfig } from '../core/chart.model';

/** One state a period can be in: its `key` in the data, and what it's called and colored. */
export class PcacStateTimelineState {
  /** The state's key, as a period's `data` names it. */
  key = ''

  /** What it's called in the tooltip and to screen readers; its `key` when unset. */
  label?: string

  /**
   * Any CSS color. Unset, the theme's: a pale green for the first state, a strong red for the last
   * and amber for any between, as `ok`, `warning`, `error` usually are. Pick colors that differ in
   * lightness as well as hue, as those do, so a color-blind reader can tell them apart.
   */
  color?: string
}

/**
 * A state timeline: one row per thing watched, each a run of periods (days, hours) side by side,
 * colored by the worst state the thing was in during that period - so an hour of Error in a day
 * otherwise OK still shows. It suits a status history, where what matters is when something went
 * wrong and how much, not a value.
 *
 * `data` is the rows, each holding its periods in order, oldest first. A row's `key` is its name,
 * shown to the left of it unless `rowLabels` is off. A period's `key` names it in the tooltip and
 * to screen readers (`'Fri, Nov 20'`), its `value` is its length in any unit, and its `data` the
 * time it spent in each state, in the same unit, keyed by the state's `key`. Time the states don't
 * cover is unknown; with no `value`, the period's length is the time in its states, so all of it
 * is known. Every period of a row is drawn the same width, whatever its length. A row or period
 * with `hide` is left out.
 *
 * A period is drawn in the color of the worst state it was in, by the order of `states`, deeper
 * the more of what's known of it that state took (from 75% of the color to all of it). Striped
 * when part of it is unknown, and plain gray when all of it is.
 */
export class PcacStateTimelineConfig extends PcacChartConfig {
  /** The states, least severe first: a period shows the last of them it was in. */
  states: PcacStateTimelineState[] = []

  /**
   * Space between periods, in px; default 2. It drops to 1px when it would take more than a
   * quarter of each period's room (90 days in a narrow column), and to none when even that would
   * leave a period under a pixel wide. Optional, so an object literal needn't spell it out.
   */
  gap?: number = 2

  /** Show each row's name to the left of it; default true. Optional, likewise. */
  rowLabels?: boolean = true
}
