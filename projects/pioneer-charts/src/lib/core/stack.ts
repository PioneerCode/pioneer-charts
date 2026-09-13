import { PcacData } from './chart.model';

/**
 * Where each bar of a stacked group starts: the running total of the bars before it, in data
 * order, so the first bar sits on the baseline and each later one on top of the previous. Values
 * are the bar's *own* size (segment), not a pre-accumulated total; a null value counts as 0.
 *
 * Keyed by the bar's own `PcacData` object so D3 callbacks (which only get the datum) can look
 * their offset up directly.
 */
export function stackStarts(groups: PcacData[]): Map<PcacData, number> {
  const starts = new Map<PcacData, number>();
  for (const group of groups) {
    let total = 0;
    for (const bar of group.data) {
      starts.set(bar, total);
      total += Number(bar.value ?? 0);
    }
  }
  return starts;
}
