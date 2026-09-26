import { PcacData } from './chart.model';

/**
 * How long each bar is drawn: its value, or 0 when it can't be drawn - a null or non-numeric
 * value, or `hide` set on the bar or on its whole group. A hidden bar keeps its slot (and so its
 * color) and just draws nothing, the same way a hidden line/area/plot series keeps its place.
 * A negative value is drawn as 0 too: the bar charts only draw upward from a 0 baseline, and a
 * negative size was an invalid SVG `height`/`width` (the bar vanished with a console error) that
 * also pulled the rest of a stack down over the bars before it.
 *
 * Keyed by the bar's own `PcacData` object so D3 callbacks (which only get the datum) can look
 * their size up directly.
 */
export function barSizes(groups: PcacData[]): Map<PcacData, number> {
  const sizes = new Map<PcacData, number>();
  for (const group of groups) {
    for (const bar of group.data ?? []) {
      const value = Number(bar.value ?? 0);
      sizes.set(bar, group.hide || bar.hide || !Number.isFinite(value) ? 0 : Math.max(0, value));
    }
  }
  return sizes;
}

/**
 * Where each bar of a stacked group starts: the running total of the bars before it, in data
 * order, so the first bar sits on the baseline and each later one on top of the previous. Sizes
 * are the bar's *own* (segment), not a pre-accumulated total, taken from `barSizes` - so a null,
 * non-numeric or hidden bar adds nothing to the stack.
 */
export function stackStarts(groups: PcacData[], sizes = barSizes(groups)): Map<PcacData, number> {
  const starts = new Map<PcacData, number>();
  for (const group of groups) {
    let total = 0;
    for (const bar of group.data ?? []) {
      starts.set(bar, total);
      total += sizes.get(bar) ?? 0;
    }
  }
  return starts;
}
