import { PcacData } from '../core/chart.model';
import { placeProximity, proximityDistance, proximityValue } from './proximity-layout';

const item = (key: string, value: number | string | null, extra: Partial<PcacData> = {}): PcacData =>
  ({ key, value, hide: false, data: [], ...extra });

describe('proximityDistance', () => {
  it('runs from 0 at closeValue to 1 at farValue, held at both ends', () => {
    expect(proximityDistance(1, 1, 0)).toBe(0);
    expect(proximityDistance(0.75, 1, 0)).toBe(0.25);
    expect(proximityDistance(0, 1, 0)).toBe(1);
    expect(proximityDistance(-2, 1, 0)).toBe(1);
    expect(proximityDistance(3, 1, 0)).toBe(0);
  });

  it('works the other way round for a distance', () => {
    expect(proximityDistance(5, 0, 20)).toBe(0.25);
  });

  it('puts everything at the center when the ends are equal', () => {
    expect(proximityDistance(4, 2, 2)).toBe(0);
  });
});

describe('placeProximity', () => {
  it('spaces items evenly clockwise from the start angle, in data order', () => {
    const placed = placeProximity([item('a', 0.9), item('b', 0.8), item('c', 0.7), item('d', 0.6)], 1, 0);
    expect(placed.map((p) => p.angle)).toEqual([0, Math.PI / 2, Math.PI, 1.5 * Math.PI]);
    expect(placed.map((p) => +p.distance.toFixed(2))).toEqual([0.1, 0.2, 0.3, 0.4]);

    const turned = placeProximity([item('a', 1)], 1, 0, 90);
    expect(turned[0].angle).toBeCloseTo(Math.PI / 2);
  });

  it('leaves out hidden items and items without a number, which take no slot', () => {
    const placed = placeProximity([item('a', 1), item('hidden', 1, { hide: true }), item('none', null), item('b', '0.5')], 1, 0);
    expect(placed.map((p) => [p.data.key, p.index, p.angle])).toEqual([['a', 0, 0], ['b', 3, Math.PI]]);
  });

  it('reads numeric strings as values', () => {
    expect(proximityValue(item('s', '0.25'))).toBe(0.25);
    expect(proximityValue(item('e', ''))).toBeNull();
  });
});
