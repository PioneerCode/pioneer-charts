import { Area, area } from 'd3-shape';
import { getXFormat } from '../x-format';
import { PcacData, PcacFormatEnum } from '../../../core';
import { PlaChartScales } from './scales.builder';

export function buildAreaGenerator(format: PcacFormatEnum, scales: PlaChartScales, chartHeight: number): Area<PcacData> {
  return area<PcacData>()
    .x((d: PcacData, i) => {
      return getXFormat(format, d, i, scales.x);
    })
    .y0(chartHeight)
    .y1((d: PcacData) => {
      return scales.y(d.value as number);
    });
}