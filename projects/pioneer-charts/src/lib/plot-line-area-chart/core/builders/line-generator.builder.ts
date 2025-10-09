import { line, Line } from 'd3-shape';
import { getXFormat } from '../x-format';
import { PcacFormatEnum } from '../../../core';
import { PlaChartScales } from './scales.builder';

export function buildLineGenerator(format: PcacFormatEnum, scales: PlaChartScales): Line<[number, number]> {
  return line()
    .x((d: any, i) => {
      return getXFormat(format, d, i, scales.x)
    })
    .y((d: any) => {
      return scales.y(d.value);
    });
}