import { PcacData } from '../../../core';

/** Whether a point has a numeric value to draw at. */
export function hasValue(d: PcacData): boolean {
  return d.value !== null && d.value !== undefined && d.value !== '' && Number.isFinite(Number(d.value));
}
