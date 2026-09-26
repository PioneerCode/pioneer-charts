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

/**
 * Whether every bar has a key that is unique within its own group - what coloring bars by series
 * key needs. Without that (keys left `null`, as `PcacData` defaults them, or repeated within a
 * group, as stacked data often has), coloring by key would paint every bar sharing a key the
 * same color, so the bars fall back to being colored by their position in the group.
 */
export function hasDistinctSeriesKeys(groups: PcacData[]): boolean {
  return groups.every((group) => {
    const keys = (group.data ?? []).map((bar) => bar.key);
    return keys.every((key) => key !== null && key !== undefined && key !== '')
      && new Set(keys).size === keys.length;
  });
}

/**
 * Whether a band scale spanning `length` pixels across `count` bands can round them to whole
 * pixels. Rounding gives crisp bar edges, but it floors the step - so with more bands than pixels
 * every band collapses to 0 and nothing draws. Only rounded while each band gets at least 2px.
 */
export function canRoundBands(length: number, count: number): boolean {
  return count > 0 && length / count >= 2;
}

let warnedOfColorOverrideObject = false;

/**
 * A bar config's `colorOverride` as the plain list of colors every chart now takes. Up to 22.2 the
 * bar charts wrapped it as `{ colors: [...] }`; a config still shaped that way - which TypeScript
 * misses when it's spread together or loaded as JSON - is still read, and development builds warn
 * about it once.
 */
export function barColorOverride(override: readonly string[] | { colors?: readonly string[] } | undefined): readonly string[] | undefined {
  if (!override || Array.isArray(override)) {
    return override as readonly string[] | undefined;
  }
  if (typeof ngDevMode !== 'undefined' && ngDevMode && !warnedOfColorOverrideObject) {
    warnedOfColorOverrideObject = true;
    console.warn(
      'Pioneer Charts: a bar chart\'s `colorOverride` is now a plain array of colors, like the other ' +
      'charts\' - use `colorOverride: [...]` rather than `colorOverride: { colors: [...] }`.',
    );
  }
  return (override as { colors?: readonly string[] }).colors;
}
