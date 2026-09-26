import { PcacData, PcacFormatEnum } from '../../../core/chart.model';
import { hasKey } from '../x-format';
import { hasValue } from './has-value';

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
      // Same test as the line/dots use, so a point that isn't drawn (`''`, NaN) never joins a ring.
      if (!hasValue(data)) {
        return;
      }
      // By numeric value, so `5` and `'5'` - drawn at the same spot - are recognized as sharing it.
      const key = `${xPositionKey(xFormat, data, index)}|${Number(data.value)}`;
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
      return hasKey(data) ? new Date(data.key as string | number).getTime() : 'none';
    case PcacFormatEnum.Decimal:
      return hasKey(data) ? Number(data.key) : 'none';
    default:
      return index;
  }
}

/**
 * The smallest ring radius at which `count` marks of `size` px sit `gap` px apart from their
 * neighbors: the chord between adjacent ring positions is `2r sin(π/n)`, so solve it for
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

/** A pixel position within the plot area, the way the scales report one. */
export interface PlaPoint {
  x: number;
  y: number;
}

/**
 * How far to move a whole fanned-out ring so that none of its members' centers leave the plot
 * area - so a member at the edge of the domain hangs over the axis by at most half its mark,
 * exactly as a lone point at that coordinate would, rather than by half its mark plus the ring's
 * radius. The ring moves as one (its members keep their spacing) and the anchor stays put, so the
 * spokes simply get longer on the side that was pushed back. Per axis: if the ring pokes out past
 * 0 it comes back by that much, else if it pokes out past the far edge it comes back by that; a
 * ring too big to fit is kept in at the axis end, where the origin is.
 *
 * `anchor` is clamped to the plot area first, so once zoom carries a group's coordinate out of the
 * domain its members follow it out at the same pace instead of staying pinned to the edge (or
 * snapping the ring's radius the moment the anchor crosses): at the edge the correction is exactly
 * the outermost member's offset, and stays so beyond it.
 */
export function fanOutShift(anchor: PlaPoint, offsets: PlaPointOffset[], plot: { width: number; height: number }): PlaPointOffset {
  const dxs = offsets.map((o) => o.dx);
  const dys = offsets.map((o) => o.dy);
  return {
    dx: axisShift(clamp(anchor.x, 0, plot.width), Math.min(...dxs), Math.max(...dxs), plot.width),
    dy: axisShift(clamp(anchor.y, 0, plot.height), Math.min(...dys), Math.max(...dys), plot.height),
  };
}

function axisShift(anchor: number, min: number, max: number, size: number): number {
  if (anchor + min < 0) {
    return round(-(anchor + min));
  }
  if (anchor + max > size) {
    return round(size - (anchor + max));
  }
  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
