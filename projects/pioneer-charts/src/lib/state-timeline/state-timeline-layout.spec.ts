import { PcacData } from '../core/chart.model';
import { periodGap, periodLabel, periodState, periodSummary, placePeriods, PcacStatePeriod } from './state-timeline-layout';
import { PcacStateTimelineState } from './state-timeline.model';

const STATES: PcacStateTimelineState[] = [
  { key: 'ok', label: 'OK' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' },
];

/** A period of `length`, holding the time it spent in each state. */
const period = (key: string, length: number | null, times: Record<string, number>, extra: Partial<PcacData> = {}): PcacData =>
  ({ key, value: length, hide: false, data: Object.entries(times).map(([state, time]) => ({ key: state, value: time, hide: false, data: [] })), ...extra });
const row = (key: string, periods: PcacData[], hide = false): PcacData => ({ key, value: null, hide, data: periods });

describe('periodState', () => {
  it('is the worst state the period was in, by the order the states are listed', () => {
    expect(periodState(period('d', 24, { ok: 20, error: 4 }), STATES).state).toBe(2);
    expect(periodState(period('d', 24, { ok: 20, warning: 4 }), STATES).state).toBe(1);
    expect(periodState(period('d', 24, { ok: 24 }), STATES).state).toBe(0);
  });

  it('gives that state\'s share of what is known of the period, for its depth', () => {
    const s = periodState(period('d', 24, { ok: 15, error: 3 }), STATES);
    // 6 of the 24 unknown: the error is 3 of the 18 known
    expect(s.share).toBeCloseTo(3 / 18);
    expect(s.unknownShare).toBeCloseTo(6 / 24);
    expect(periodState(period('d', 24, { ok: 24 }), STATES).share).toBe(1);
  });

  it('is no state, wholly unknown, when nothing is known of the period', () => {
    expect(periodState(period('d', 24, {}), STATES)).toEqual({ state: null, share: 0, unknownShare: 1 });
    expect(periodState(period('d', 24, { ok: 0, error: 0 }), STATES)).toEqual({ state: null, share: 0, unknownShare: 1 });
  });

  it('knows all of a period whose length is not given: its length is the time in its states', () => {
    expect(periodState(period('d', null, { ok: 3, error: 1 }), STATES)).toEqual({ state: 2, share: 0.25, unknownShare: 0 });
  });

  it('counts time in a state it is not given as unknown, and never more known than the period\'s length', () => {
    const s = periodState(period('d', 10, { ok: 5, paused: 5 }), STATES);
    expect(s).toEqual({ state: 0, share: 1, unknownShare: 0.5 });
    // A clock's rounding giving a little more than the length: all known, never a negative unknown
    expect(periodState(period('d', 10, { ok: 6, error: 5 }), STATES).unknownShare).toBe(0);
  });

  it('ignores times that are not positive numbers', () => {
    expect(periodState(period('d', 10, { ok: 10, error: -2 }), STATES).state).toBe(0);
    const text = { ...period('d', 10, { ok: 10 }), data: [{ key: 'error', value: 'abc', hide: false, data: [] }] };
    expect(periodState(text, STATES).state).toBeNull();
  });
});

describe('placePeriods', () => {
  it('places each shown row\'s shown periods in order, with their state', () => {
    const placed = placePeriods([
      row('Disk', [period('Mon', 24, { ok: 24 }), period('Tue', 24, { ok: 12, error: 12 })]),
      row('Hidden', [period('Mon', 24, { ok: 24 })], true),
      row('Video', [period('Mon', 24, { ok: 24 }, { hide: true }), period('Tue', 24, {})]),
    ], STATES);
    expect(placed.map((p) => [p.row.key, p.rowIndex, p.data.key, p.index, p.state])).toEqual([
      ['Disk', 0, 'Mon', 0, 0],
      ['Disk', 0, 'Tue', 1, 2],
      // Its place among the rows drawn, so a hidden row leaves no empty one
      ['Video', 1, 'Tue', 0, null],
    ]);
  });
});

describe('periodGap', () => {
  it('is the gap asked for while it takes no more than a quarter of each period\'s room', () => {
    // 30 periods in 257px: 8.6px each
    expect(periodGap(257, 30, 2)).toBe(2);
    // Exactly a quarter: 8px each
    expect(periodGap(80, 10, 2)).toBe(2);
  });

  it('drops to 1px when periods are narrower, as 90 are in the same room', () => {
    expect(periodGap(257, 90, 2)).toBe(1);
  });

  it('drops to none when even 1px would leave a period under a pixel', () => {
    expect(periodGap(150, 90, 2)).toBe(0);
  });

  it('is none with no gap asked for, or no periods', () => {
    expect(periodGap(257, 30, 0)).toBe(0);
    expect(periodGap(257, 30, -1)).toBe(0);
    expect(periodGap(257, 0, 2)).toBe(0);
  });
});

describe('periodLabel', () => {
  const at = (p: PcacData): PcacStatePeriod => ({ data: p, row: row('Disk', [p]), rowIndex: 0, index: 0, ...periodState(p, STATES) });

  it('names each state the period was in, worst first, with its share of the period', () => {
    expect(periodLabel(at(period('Nov 20', 24, { ok: 18, error: 6 })), STATES)).toBe('Nov 20: Error 25%, OK 75%');
  });

  it('says how much was unknown, and a share under 1% as such', () => {
    expect(periodLabel(at(period('Nov 20', 1000, { ok: 897, error: 3 })), STATES)).toBe('Nov 20: Error <1%, OK 90%, unknown 10%');
  });

  it('says a period nothing is known of is unknown', () => {
    expect(periodLabel(at(period('Nov 20', 24, {})), STATES)).toBe('Nov 20: unknown');
  });

  it('is the period\'s name and its summary, which the default tooltip shows on its own line', () => {
    expect(periodSummary(at(period('Nov 20', 24, { ok: 18, error: 6 })), STATES)).toBe('Error 25%, OK 75%');
    expect(periodSummary(at(period('Nov 20', 24, {})), STATES)).toBe('unknown');
  });

  it('names a state by its key when it has no label', () => {
    expect(periodLabel(at(period('Nov 20', 24, { ok: 24 })), [{ key: 'ok' }])).toBe('Nov 20: ok 100%');
  });
});
