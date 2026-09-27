import { PcacData } from '../core/chart.model';
import { barThreshold, barThresholdLayout, groupThreshold } from './bar-thresholds';
import { seriesKeys, seriesSlots } from './bar-series';

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

describe('seriesSlots', () => {
  const bar = (key: string | null): PcacData => ({ key, value: 1, hide: false, data: [] });
  const group = (key: string, bars: PcacData[]): PcacData => ({ key, value: null, hide: false, data: bars });

  it('places bars by series key when the keys tell the series apart', () => {
    const slots = seriesSlots([group('A', [bar('x'), bar('y')]), group('B', [bar('y')])]);

    expect(slots.domain).toEqual(['x', 'y']);
    expect(slots.slotOf(bar('y'), 0)).toBe('y');
  });

  it('places bars by position when they have no keys, or repeat one', () => {
    const slots = seriesSlots([group('A', [bar(null), bar(null), bar(null)]), group('B', [bar('x'), bar('x')])]);

    expect(slots.domain).toEqual(['0', '1', '2']);
    expect([0, 1, 2].map((i) => slots.slotOf(bar(null), i))).toEqual(['0', '1', '2']);
  });
});
