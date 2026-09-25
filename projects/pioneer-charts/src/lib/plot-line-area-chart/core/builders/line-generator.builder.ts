import { line, Line } from 'd3-shape';
import { getXFormat } from '../x-format';
import { PcacData, PcacFormatEnum } from '../../../core';
import { PlaChartScales } from './scales.builder';
import { hasValue } from './has-value';

export function buildLineGenerator(format: PcacFormatEnum, scales: PlaChartScales): Line<PcacData> {
  return line<PcacData>()
    // A point with no numeric value leaves a gap rather than a NaN in the path, which browsers stop
    // drawing at - hiding the rest of the line.
    .defined(hasValue)
    .x((d: PcacData, i) => {
      return getXFormat(format, d, i, scales.x)
    })
    .y((d: PcacData) => {
      return scales.y(d.value as number);
    });
}