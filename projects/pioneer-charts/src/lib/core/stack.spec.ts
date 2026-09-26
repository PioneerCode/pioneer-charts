import { PcacData } from './chart.model';
import { barSizes, stackStarts } from './stack';

function bar(value: PcacData['value'], hide = false): PcacData {
  return { key: 'k', value, hide, data: [] };
}

describe('barSizes', () => {
  it('uses each bar\'s value, 0 for a null or non-numeric one', () => {
    const bars = [bar(5), bar(null), bar('abc')];
    const sizes = barSizes([{ key: 'g', value: null, hide: false, data: bars }]);

    expect(bars.map((b) => sizes.get(b))).toEqual([5, 0, 0]);
  });

  it('gives hidden bars, and every bar of a hidden group, a size of 0', () => {
    const shown = bar(5);
    const hidden = bar(7, true);
    const inHiddenGroup = bar(9);
    const sizes = barSizes([
      { key: 'a', value: null, hide: false, data: [shown, hidden] },
      { key: 'b', value: null, hide: true, data: [inHiddenGroup] },
    ]);

    expect([sizes.get(shown), sizes.get(hidden), sizes.get(inHiddenGroup)]).toEqual([5, 0, 0]);
  });

  it('draws a negative value as 0', () => {
    const bars = [bar(-5), bar(5)];
    const sizes = barSizes([{ key: 'g', value: null, hide: false, data: bars }]);

    expect(bars.map((b) => sizes.get(b))).toEqual([0, 5]);
  });

  it('tolerates a group without data', () => {
    expect(barSizes([{ key: 'g', value: 1, hide: false } as PcacData]).size).toBe(0);
  });
});

describe('stackStarts', () => {
  // Regression test: a non-numeric value made the running total NaN for the rest of the group.
  it('stacks past null, non-numeric and hidden bars as if they were 0', () => {
    const bars = [bar(10), bar('abc'), bar(20, true), bar(null), bar(5)];
    const starts = stackStarts([{ key: 'g', value: null, hide: false, data: bars }]);

    expect(bars.map((b) => starts.get(b))).toEqual([0, 10, 10, 10, 10]);
  });

  // Regression test: a negative segment pulled every later one in its stack down, overlapping the
  // bars before it.
  it('doesn\'t let a negative bar pull the rest of the stack down', () => {
    const bars = [bar(10), bar(-4), bar(5)];
    const starts = stackStarts([{ key: 'g', value: null, hide: false, data: bars }]);

    expect(bars.map((b) => starts.get(b))).toEqual([0, 10, 10]);
  });
});
