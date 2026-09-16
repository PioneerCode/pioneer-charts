import { PcacData, PcacFormatEnum } from '../../../core/chart.model';

/** A point along with where it sits in the chart's `data`, the way a tooltip context reports it. */
export interface PlaCoincidentPoint {
  data: PcacData;
  series: PcacData;
  /** Position of `data` within `series.data`. */
  index: number;
  /** Position of `series` within the chart's top-level `data`. */
  seriesIndex: number;
}

/** Two or more points that would be drawn at exactly the same coordinate, in data order. */
export interface PlaCoincidentGroup {
  members: PlaCoincidentPoint[];
}

/** How far a fanned-out point is drawn from its true coordinate, in px. */
export interface PlaPointOffset {
  dx: number;
  dy: number;
}

/**
 * Finds every set of points that share a coordinate across all of the chart's visible series.
 * Coincidence is decided from the data rather than from scaled pixels, so this can run before
 * the scales exist (the space the fan-out needs has to be reserved before the plot area, and so
 * the scales, is sized): two points coincide when they have the same y `value` and the same x
 * position under `xFormat` - the same numeric `key` (`Decimal`), the same instant (`DateTime`), or
 * the same index within their series (every other format, which positions by index). Mirrors
 * `getXFormat()`, which is what actually places them. Hidden series and points without a value
 * are left out, as they aren't drawn.
 */
export function findCoincidentGroups(series: PcacData[], xFormat: PcacFormatEnum): PlaCoincidentGroup[] {
  const byPosition = new Map<string, PlaCoincidentPoint[]>();
  series.forEach((s, seriesIndex) => {
    if (s.hide) {
      return;
    }
    s.data.forEach((data, index) => {
      if (data.value === null || data.value === undefined) {
        return;
      }
      const key = `${xPositionKey(xFormat, data, index)}|${data.value}`;
      let members = byPosition.get(key);
      if (!members) {
        members = [];
        byPosition.set(key, members);
      }
      members.push({ data, series: s, index, seriesIndex });
    });
  });
  return Array.from(byPosition.values())
    .filter((members) => members.length > 1)
    .map((members) => ({ members }));
}

function xPositionKey(xFormat: PcacFormatEnum, data: PcacData, index: number): string | number {
  switch (xFormat) {
    case PcacFormatEnum.DateTime:
      return data.key ? new Date(data.key).getTime() : 'none';
    case PcacFormatEnum.Decimal:
      return data.key ? Number(data.key) : 'none';
    default:
      return index;
  }
}

/**
 * The smallest ring radius at which `count` marks of `size` px sit `gap` px apart from their
 * neighbours: the chord between adjacent ring positions is `2r sin(π/n)`, so solve it for
 * `size + gap`. A pair (n = 2) lands `size + gap` apart along a diameter, as expected.
 */
export function fanOutRadius(count: number, size: number, gap: number): number {
  return (size + gap) / (2 * Math.sin(Math.PI / count));
}

/**
 * Places each group's members evenly around a ring centered on their shared coordinate, the
 * first member at 12 o'clock and the rest clockwise. `radius` is called per group so it can
 * depend on the group's size (see `fanOutRadius`). Keyed by the point objects themselves,
 * which are the very elements the builder binds to the DOM, so lookups are exact.
 */
export function fanOutOffsets(groups: PlaCoincidentGroup[], radius: (group: PlaCoincidentGroup) => number): Map<PcacData, PlaPointOffset> {
  const offsets = new Map<PcacData, PlaPointOffset>();
  for (const group of groups) {
    const r = radius(group);
    const n = group.members.length;
    group.members.forEach((member, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      offsets.set(member.data, { dx: round(r * Math.cos(angle)), dy: round(r * Math.sin(angle)) });
    });
  }
  return offsets;
}

/** Two decimal places is plenty for an SVG coordinate and keeps `cos(π/2)` from reading as `6e-17`. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
