import { PcacData } from '../core/chart.model';

/** Where one surrounding item sits, in polar terms around the center. */
export interface PcacProximityPlacement {
  data: PcacData;
  /** Its index in `config.data`: which color it takes. */
  index: number;
  /** The item's value, as a number. */
  value: number;
  /** Clockwise from 12 o'clock, in radians. */
  angle: number;
  /** How far out it sits, from 0 (the center) to 1 (the outer rim). */
  distance: number;
}

/** An item's value as a number, or `null` when it has none. */
export function proximityValue(d: PcacData): number | null {
  const value = typeof d.value === 'number' ? d.value : typeof d.value === 'string' && d.value.trim() !== '' ? Number(d.value) : NaN;
  return Number.isFinite(value) ? value : null;
}

/**
 * Where a value sits between the center and the rim: 0 at `closeValue`, 1 at `farValue`, in
 * proportion between them and held at either end beyond them. Equal ends put everything at 0.
 */
export function proximityDistance(value: number, closeValue: number, farValue: number): number {
  if (closeValue === farValue) {
    return 0;
  }
  return Math.min(1, Math.max(0, (value - closeValue) / (farValue - closeValue)));
}

/**
 * Places every drawable item evenly around the center, clockwise from `startAngle` (degrees from
 * 12 o'clock) in data order, each at its value's distance. Hidden items and items without a
 * numeric value are left out, and don't take up a slot.
 */
export function placeProximity(
  data: PcacData[],
  closeValue: number,
  farValue: number,
  startAngle = 0,
): PcacProximityPlacement[] {
  const drawable = data
    .map((d, index) => ({ d, index, value: proximityValue(d) }))
    .filter((item): item is { d: PcacData; index: number; value: number } => !item.d.hide && item.value !== null);
  const start = (startAngle * Math.PI) / 180;
  return drawable.map(({ d, index, value }, slot) => ({
    data: d,
    index,
    value,
    angle: start + (slot / drawable.length) * 2 * Math.PI,
    distance: proximityDistance(value, closeValue, farValue),
  }));
}
