import { PcacData } from '../core/chart.model';
import { barThreshold, barThresholdLayout, groupThreshold } from './bar-thresholds';
import { seriesKeys } from './bar-series';

function t(value: number | null, data: PcacData[] = []): PcacData {
  return { key: null, value, hide: false, data };
}

describe('barThresholdLayout', () => {
  it('draws nothing without thresholds', () => {
    expect(barThresholdLayout([], false)).toBe('none');
    expect(barThresholdLayout(undefined, false)).toBe('none');
  });

  // Regression test: the branches tested `!data`, but `data: []` - the documented shape and the
  // PcacData default - is truthy, so the whole-chart threshold was never drawn.
  it('reads one entry with an empty data as a threshold across the chart', () => {
    expect(barThresholdLayout([t(50)], false)).toBe('chart');
  });

  it('reads one entry per group with empty data as a threshold per group', () => {
    expect(barThresholdLayout([t(50), t(60)], false)).toBe('group');
  });

  it('reads entries with per-bar data as a threshold per bar', () => {
    expect(barThresholdLayout([t(null, [t(1), t(2)]), t(null, [t(3), t(4)])], false)).toBe('bar');
  });

  it('allows per-bar thresholds on a single-group chart', () => {
    expect(barThresholdLayout([t(null, [t(1), t(2)])], false)).toBe('bar');
  });

  it('reads per-bar entries as per-group thresholds on a stacked chart', () => {
    expect(barThresholdLayout([t(null, [t(1)]), t(null, [t(2)])], true)).toBe('group');
  });
});

describe('groupThreshold / barThreshold', () => {
  it('takes a group threshold from the entry, or its first data item', () => {
    expect(groupThreshold([t(50)], 0)?.value).toBe(50);
    expect(groupThreshold([t(null, [t(70)])], 0)?.value).toBe(70);
  });

  it('is null for a missing entry or a non-numeric value', () => {
    expect(groupThreshold([t(50)], 3)).toBeNull();
    expect(groupThreshold([t(null)], 0)).toBeNull();
    expect(barThreshold([t(null, [t(1)])], 0, 5)).toBeNull();
    expect(barThreshold([t(null, [t(1)])], 2, 0)).toBeNull();
  });
});

describe('seriesKeys', () => {
  it('collects every group\'s series keys in first-seen order', () => {
    const group = (keys: string[]): PcacData =>
      ({ key: 'g', value: null, hide: false, data: keys.map((key) => ({ key, value: 1, hide: false, data: [] })) });

    expect(seriesKeys([group(['a']), group(['a', 'b', 'c']), group(['d', 'b'])])).toEqual(['a', 'b', 'c', 'd']);
  });
});
