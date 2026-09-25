import { PcacData } from '../core/chart.model';

/** How a bar chart's `thresholds` are laid out; see `barThresholdLayout`. */
export type BarThresholdLayout = 'none' | 'chart' | 'group' | 'bar';

/** Whether a threshold entry carries per-bar values in its `data`. */
function hasBars(entry: PcacData): boolean {
  return (entry.data?.length ?? 0) > 0;
}

/** A threshold is only drawn when its value is a finite number. */
function drawable(threshold: PcacData | undefined): PcacData | null {
  if (!threshold || threshold.value === null || threshold.value === undefined) {
    return null;
  }
  return Number.isFinite(Number(threshold.value)) ? threshold : null;
}

/**
 * Reads the shape of `thresholds` the way the docs describe it:
 * - one entry with an empty (or no) `data` - a single threshold across the whole chart;
 * - one entry per group, each with an empty `data` - a threshold per group;
 * - one entry per group, each with an entry per bar in its `data` - a threshold per bar.
 *
 * A stacked group is drawn as one bar, so on a stacked chart per-bar entries give per-group
 * thresholds, each group's taken from its entry's first `data` item. Checks `data.length` rather
 * than `data`'s truthiness: `PcacData.data` defaults to `[]`, which is truthy.
 */
export function barThresholdLayout(
  thresholds: PcacData[] | undefined,
  isStacked: boolean,
): BarThresholdLayout {
  if (!thresholds?.length) {
    return 'none';
  }
  if (!thresholds.some(hasBars)) {
    return thresholds.length === 1 ? 'chart' : 'group';
  }
  return isStacked ? 'group' : 'bar';
}

/**
 * The threshold drawn across the group at `groupIndex` (or across the chart, for index 0 of a
 * `'chart'` layout): the entry itself, or its first `data` item when it has per-bar values. Null
 * when there's no entry for that group or no numeric value to draw.
 */
export function groupThreshold(thresholds: PcacData[], groupIndex: number): PcacData | null {
  const entry = thresholds[groupIndex];
  if (!entry) {
    return null;
  }
  return drawable(hasBars(entry) ? entry.data[0] : entry);
}

/** The threshold drawn across one bar, or null when that bar has none (or no numeric value). */
export function barThreshold(
  thresholds: PcacData[],
  groupIndex: number,
  barIndex: number,
): PcacData | null {
  return drawable(thresholds[groupIndex]?.data?.[barIndex]);
}
