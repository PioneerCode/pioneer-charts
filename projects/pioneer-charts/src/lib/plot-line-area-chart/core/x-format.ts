import { ScaleLinear, ScaleTime } from "d3";
import { PcacData, PcacFormatEnum } from "../../core";

export function getXFormat(type: PcacFormatEnum, data: PcacData, index: number, xScale: ScaleLinear<number, number> | ScaleTime<number, number, never>) {
    switch (type) {
      case PcacFormatEnum.DateTime:
        if (data.key) {
          return xScale(new Date(data.key));
        }
        return 0
      case PcacFormatEnum.Decimal:
        if (data.key) {
          return xScale(data.key as unknown as number);
        }
        return 0
      default:
        return xScale(index)
    }
}