import { PcacData } from '../core/chart.model';

/**
 * Every series key across all groups, in first-seen order: the domain of a grouped bar chart's
 * inner band, so each series has its own slot in every group. Taken from the first group alone,
 * a series that only later groups have fell outside the band and was drawn over the first slot.
 */
export function seriesKeys(groups: PcacData[]): string[] {
  const keys = new Set<string>();
  for (const group of groups) {
    for (const bar of group.data ?? []) {
      keys.add(bar.key as string);
    }
  }
  return [...keys];
}
