import { PcacData } from '../core/chart.model';
import { dotValue, stackDots, tallestColumn } from './dot-plot-layout';

const point = (key: string, value: number | string | null, extra: Partial<PcacData> = {}): PcacData =>
  ({ key, value, hide: false, data: [], ...extra });
const series = (key: string, points: PcacData[], hide = false): PcacData => ({ key, value: null, hide, data: points });

describe('stackDots', () => {
  it('stacks equal values into one column, in data order across series', () => {
    const placed = stackDots([
      series('A', [point('a1', 5), point('a2', 7)]),
      series('B', [point('b1', 5)]),
    ]);
    expect(placed.map((p) => [p.data.key, p.position, p.level, p.seriesIndex])).toEqual([
      ['a1', 5, 0, 0],
      ['a2', 7, 0, 0],
      ['b1', 5, 1, 1],
    ]);
  });

  it('bins values by binWidth from the origin, placing each column at its bin center', () => {
    const placed = stackDots([series('A', [point('x', 7), point('y', 7.5), point('z', 8)])], 1, 0);
    expect(placed.map((p) => [p.position, p.level])).toEqual([[7.5, 0], [7.5, 1], [8.5, 0]]);

    const shifted = stackDots([series('A', [point('x', 7)])], 2, 1);
    expect(shifted[0].position).toBe(8);
  });

  it('leaves out hidden series, hidden points and points without a number', () => {
    const placed = stackDots([
      series('A', [point('shown', 1), point('hidden', 1, { hide: true }), point('none', null), point('text', 'abc')]),
      series('B', [point('b', 1)], true),
    ]);
    expect(placed.map((p) => p.data.key)).toEqual(['shown']);
  });

  it('reads numeric strings as values', () => {
    expect(dotValue(point('s', '4.5'))).toBe(4.5);
    expect(dotValue(point('e', ''))).toBeNull();
  });

  it('knows its tallest column', () => {
    expect(tallestColumn(stackDots([series('A', [point('a', 1), point('b', 1), point('c', 2)])]))).toBe(2);
    expect(tallestColumn([])).toBe(0);
  });
});
