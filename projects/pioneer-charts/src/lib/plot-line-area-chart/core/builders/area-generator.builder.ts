import { Area, area } from 'd3-shape';
import { getXFormat } from '../x-format';
import { PcacFormatEnum } from '../../../core';
import { PlaChartScales } from './scales.builder';

export function buildAreaGenerator(format: PcacFormatEnum, scales: PlaChartScales, chartHeight: number): Area<[number, number]> {
  return area()
    .x((d: any, i) => {
      return getXFormat(format, d, i, scales.x);
    })
    .y0(chartHeight)
    .y1((d: any) => {
      return scales.y(d.value);
    });
}