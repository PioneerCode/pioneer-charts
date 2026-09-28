import { PcacData } from '../core/chart.model';

/** Where one point sits in a dot plot, before it's scaled to pixels. */
export interface PcacDotPlacement {
  /** The point itself (the element from its series' `data`). */
  data: PcacData;
  /** Its series, and that series' index in `config.data` - which color it takes. */
  series: PcacData;
  seriesIndex: number;
  /** Its index within its series' `data`. */
  index: number;
  /** Where its column sits on the value axis: its value, or its bin's center. */
  position: number;
  /** Its place in the column, 0 at the bottom. */
  level: number;
}

/** A point's value as a number to place it by, or `null` when it has none. */
export function dotValue(d: PcacData): number | null {
  const value = typeof d.value === 'number' ? d.value : typeof d.value === 'string' && d.value.trim() !== '' ? Number(d.value) : NaN;
  return Number.isFinite(value) ? value : null;
}

/**
 * Stacks every drawable point into columns: points with an equal value share a column or, with a
 * positive `binWidth`, points in the same bin (bins run from `origin`, each `binWidth` wide) share
 * one at the bin's center. Within a column, points take levels in data order - series order, then
 * each series' own order - so the first is at the bottom. Hidden series and points, and points
 * with no numeric value, are left out.
 */
export function stackDots(series: PcacData[], binWidth?: number, origin = 0): PcacDotPlacement[] {
  const binned = !!binWidth && binWidth > 0;
  const levels = new Map<number, number>();
  const placements: PcacDotPlacement[] = [];
  series.forEach((s, seriesIndex) => {
    if (s.hide) {
      return;
    }
    (s.data ?? []).forEach((d, index) => {
      const value = dotValue(d);
      if (d.hide || value === null) {
        return;
      }
      const position = binned
        ? origin + (Math.floor((value - origin) / binWidth!) + 0.5) * binWidth!
        : value;
      const level = levels.get(position) ?? 0;
      levels.set(position, level + 1);
      placements.push({ data: d, series: s, seriesIndex, index, position, level });
    });
  });
  return placements;
}

/** How many marks the tallest column holds; 0 with none. */
export function tallestColumn(placements: PcacDotPlacement[]): number {
  return placements.reduce((tallest, p) => Math.max(tallest, p.level + 1), 0);
}
