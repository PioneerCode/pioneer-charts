import { Area, area } from 'd3-shape';
import { getXFormat } from '../x-format';
import { PcacData, PcacFormatEnum } from '../../../core';
import { PlaChartScales } from './scales.builder';
import { hasValue } from './has-value';

export function buildAreaGenerator(format: PcacFormatEnum, scales: PlaChartScales, chartHeight: number): Area<PcacData> {
  return area<PcacData>()
    // A point with no numeric value leaves a gap rather than a NaN in the path, which browsers stop
    // drawing at - hiding the rest of the area.
    .defined(hasValue)
    .x((d: PcacData, i) => {
      return getXFormat(format, d, i, scales.x);
    })
    .y0(chartHeight)
    .y1((d: PcacData) => {
      return scales.y(d.value as number);
    });
}