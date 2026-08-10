import { line, Line } from 'd3-shape';
import { getXFormat } from '../x-format';
import { PcacData, PcacFormatEnum } from '../../../core';
import { PlaChartScales } from './scales.builder';

export function buildLineGenerator(format: PcacFormatEnum, scales: PlaChartScales): Line<PcacData> {
  return line<PcacData>()
    .x((d: PcacData, i) => {
      return getXFormat(format, d, i, scales.x)
    })
    .y((d: PcacData) => {
      return scales.y(d.value as number);
    });
}