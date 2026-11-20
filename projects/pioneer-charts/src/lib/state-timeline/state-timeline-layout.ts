import { PcacData } from '../core/chart.model';
import { PcacStateTimelineState } from './state-timeline.model';

/** What a period was in: the worst state, how much of it, and how much of the period is unknown. */
export interface PcacPeriodState {
  /** The worst state it was in, as its index in the config's `states`; `null` when nothing is known of it. */
  state: number | null;
  /** That state's share of what's known of the period, 0 to 1: how deep its color is. */
  share: number;
  /** The share of the period nothing is known of, 0 to 1: striped when some, gray when all. */
  unknownShare: number;
}

/** Where one period sits in the timeline, and what it was in. */
export interface PcacStatePeriod extends PcacPeriodState {
  /** The period itself (the element from its row's `data`). */
  data: PcacData;
  /** Its row, and that row's place among the rows drawn. */
  row: PcacData;
  rowIndex: number;
  /** Its place among its row's periods drawn. */
  index: number;
}

/** A time as a number to add up, or 0 when it isn't a positive one. */
function time(value: PcacData['value']): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** The time the period spent in each of `states`, in their order. */
function stateTimes(period: PcacData, states: PcacStateTimelineState[]): number[] {
  return states.map((state) =>
    (period.data ?? []).filter((d) => d.key === state.key).reduce((sum, d) => sum + time(d.value), 0));
}

/**
 * The worst state the period was in, by the order of `states`, and its share of what's known of
 * the period. Time in a state not among `states` is unknown, as is any of the period's length
 * (`value`) the states don't cover; with no length, all of it is known.
 */
export function periodState(period: PcacData, states: PcacStateTimelineState[]): PcacPeriodState {
  const times = stateTimes(period, states);
  const known = times.reduce((sum, t) => sum + t, 0);
  // Never less than what's known: a clock's rounding can give a little more than the length
  const length = Math.max(time(period.value), known);
  if (known === 0) {
    return { state: null, share: 0, unknownShare: 1 };
  }
  let worst = times.length - 1;
  while (times[worst] === 0) {
    worst--;
  }
  return { state: worst, share: times[worst] / known, unknownShare: (length - known) / length };
}

/** Every shown row's shown periods, in order, each with what it was in. */
export function placePeriods(rows: PcacData[], states: PcacStateTimelineState[]): PcacStatePeriod[] {
  const placed: PcacStatePeriod[] = [];
  rows.filter((row) => !row.hide).forEach((row, rowIndex) => {
    (row.data ?? []).filter((period) => !period.hide).forEach((data, index) => {
      placed.push({ data, row, rowIndex, index, ...periodState(data, states) });
    });
  });
  return placed;
}

/**
 * The space between `count` periods across `width` px: `gap` while it takes no more than a quarter
 * of each period's room, then 1px, then none when even 1px would leave a period under a pixel.
 */
export function periodGap(width: number, count: number, gap: number): number {
  if (count <= 0 || gap <= 0) {
    return 0;
  }
  const room = width / count;
  if (gap <= room / 4) {
    return gap;
  }
  return room - 1 >= 1 ? 1 : 0;
}

/**
 * What a period was in, in words: `'Error 25%, OK 75%'`, each state it was in worst first with its
 * share of the period, then the share unknown; `'unknown'` when nothing is known of it.
 */
export function periodSummary(period: PcacStatePeriod, states: PcacStateTimelineState[]): string {
  if (period.state === null) {
    return 'unknown';
  }
  const times = stateTimes(period.data, states);
  const length = Math.max(time(period.data.value), times.reduce((sum, t) => sum + t, 0));
  const parts = states
    .map((state, i) => ({ name: state.label ?? state.key, share: times[i] / length }))
    .filter((part) => part.share > 0)
    .reverse()
    .map((part) => `${part.name} ${percent(part.share)}`);
  if (period.unknownShare > 0) {
    parts.push(`unknown ${percent(period.unknownShare)}`);
  }
  return parts.join(', ');
}

/** The period's name and what it was in, for screen readers: `'Nov 20: Error 25%, OK 75%'`. */
export function periodLabel(period: PcacStatePeriod, states: PcacStateTimelineState[]): string {
  return `${period.data.key}: ${periodSummary(period, states)}`;
}

function percent(share: number): string {
  const rounded = Math.round(share * 100);
  return rounded === 0 ? '<1%' : `${rounded}%`;
}
