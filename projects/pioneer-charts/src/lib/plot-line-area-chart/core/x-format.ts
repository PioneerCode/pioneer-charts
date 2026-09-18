import { ScaleLinear, ScaleTime } from "d3";
import { PcacData, PcacFormatEnum } from "../../core";

/**
 * Whether a point has an x key to position by. An explicit emptiness check, not truthiness: a
 * Decimal key of `0` is a perfectly good coordinate (the left edge of a `domainMin: 0` axis) and
 * used to be read as "no key" - drawn at pixel 0 whatever the domain, and pinned there under zoom.
 */
export function hasKey(data: PcacData): boolean {
  return data.key !== null && data.key !== undefined && data.key !== '';
}

export function getXFormat(type: PcacFormatEnum, data: PcacData, index: number, xScale: ScaleLinear<number, number> | ScaleTime<number, number, never>) {
    switch (type) {
      case PcacFormatEnum.DateTime:
        if (hasKey(data)) {
          return xScale(new Date(data.key as string | number));
        }
        return 0
      case PcacFormatEnum.Decimal:
        if (hasKey(data)) {
          return xScale(Number(data.key));
        }
        return 0
      default:
        return xScale(index)
    }
}
