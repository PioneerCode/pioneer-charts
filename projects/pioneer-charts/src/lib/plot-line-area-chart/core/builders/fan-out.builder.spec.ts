import { PcacData, PcacFormatEnum } from '../../../core/chart.model';
import { fanOutOffsets, fanOutRadius, findCoincidentGroups } from './fan-out.builder';

function point(key: string | number | null, value: number | null, image?: string): PcacData {
  return { key, value, hide: false, data: [], ...(image ? { image } : {}) };
}

function series(points: PcacData[], hide = false): PcacData {
  return { key: '', value: null, hide, data: points };
}

describe('findCoincidentGroups', () => {
  it('groups points across series with the same Decimal key and value, in data order', () => {
    const a = point(8.5, 8.5), b = point(8.5, 8.5), c = point(9, 8.5);
    const groups = findCoincidentGroups([series([a, c]), series([b])], PcacFormatEnum.Decimal);

    expect(groups.length).toBe(1);
    expect(groups[0].members.map((m) => m.data)).toEqual([a, b]);
    expect(groups[0].members.map((m) => [m.seriesIndex, m.index])).toEqual([[0, 0], [1, 0]]);
  });

  it('reads Decimal keys as numbers, so "8.5" and 8.5 coincide like getXFormat() draws them', () => {
    const groups = findCoincidentGroups([series([point('8.5', 1)]), series([point(8.5, 1)])], PcacFormatEnum.Decimal);
    expect(groups.length).toBe(1);
  });

  it('compares DateTime keys as instants', () => {
    const same = [series([point('2024-01-01T00:00:00Z', 1)]), series([point('2024-01-01T00:00:00.000Z', 1)])];
    const different = [series([point('2024-01-01T00:00:00Z', 1)]), series([point('2024-01-02T00:00:00Z', 1)])];
    expect(findCoincidentGroups(same, PcacFormatEnum.DateTime).length).toBe(1);
    expect(findCoincidentGroups(different, PcacFormatEnum.DateTime).length).toBe(0);
  });

  it('positions by index within the series for the default format, ignoring keys', () => {
    // Same index and value: coincident. Same key but different index: not.
    const groups = findCoincidentGroups([series([point('a', 5), point('b', 7)]), series([point('x', 5), point('a', 7)])], PcacFormatEnum.None);
    expect(groups.length).toBe(2);
    expect(groups.map((g) => g.members.map((m) => [m.seriesIndex, m.index]))).toEqual([[[0, 0], [1, 0]], [[0, 1], [1, 1]]]);
  });

  it('does not group points that differ in value', () => {
    expect(findCoincidentGroups([series([point(1, 5)]), series([point(1, 6)])], PcacFormatEnum.Decimal).length).toBe(0);
  });

  it('leaves out hidden series and points without a value', () => {
    const groups = findCoincidentGroups(
      [series([point(1, 5)]), series([point(1, 5)], true), series([point(1, null)]), series([point(1, 5)])],
      PcacFormatEnum.Decimal
    );
    expect(groups.length).toBe(1);
    expect(groups[0].members.map((m) => m.seriesIndex)).toEqual([0, 3]);
  });
});

describe('fanOutRadius', () => {
  it('puts a pair size + gap apart, across a diameter', () => {
    expect(fanOutRadius(2, 40, 4) * 2).toBeCloseTo(44);
  });

  it('grows with the group so neighbours on the ring stay size + gap apart', () => {
    const r = fanOutRadius(5, 40, 4);
    const chord = 2 * r * Math.sin(Math.PI / 5);
    expect(chord).toBeCloseTo(44);
    expect(r).toBeGreaterThan(fanOutRadius(3, 40, 4));
  });
});

describe('fanOutOffsets', () => {
  it('places the first member at 12 o\'clock and the rest clockwise at equal angles', () => {
    const a = point(1, 1), b = point(1, 1), c = point(1, 1), d = point(1, 1);
    const offsets = fanOutOffsets([{ members: [a, b, c, d].map((data, i) => ({ data, series: series([]), index: 0, seriesIndex: i })) }], () => 10);

    // SVG y grows downward, so "up" is a negative dy.
    expect(offsets.get(a)).toEqual({ dx: 0, dy: -10 });
    expect(offsets.get(b)).toEqual({ dx: 10, dy: 0 });
    expect(offsets.get(c)).toEqual({ dx: 0, dy: 10 });
    expect(offsets.get(d)).toEqual({ dx: -10, dy: 0 });
  });

  it('asks for the radius per group', () => {
    const [a, b, c] = [point(1, 1), point(1, 1), point(2, 2)];
    const groups = [
      { members: [a, b].map((data, i) => ({ data, series: series([]), index: 0, seriesIndex: i })) },
      { members: [c, point(2, 2)].map((data, i) => ({ data, series: series([]), index: 0, seriesIndex: i })) },
    ];
    const offsets = fanOutOffsets(groups, (group) => (group.members[0].data === a ? 5 : 20));
    expect(offsets.get(a)).toEqual({ dx: 0, dy: -5 });
    expect(offsets.get(c)).toEqual({ dx: 0, dy: -20 });
  });
});
