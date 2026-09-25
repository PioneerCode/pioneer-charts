import { scaleLinear } from 'd3-scale';
import { PcacData, PcacFormatEnum } from '../../../core';
import { buildAreaGenerator } from './area-generator.builder';
import { buildLineGenerator } from './line-generator.builder';
import { PlaChartScales } from './scales.builder';

const scales = {
  x: scaleLinear().domain([0, 2]).range([0, 20]),
  y: scaleLinear().domain([0, 100]).range([200, 0]),
} as unknown as PlaChartScales;

const points = (values: PcacData['value'][]): PcacData[] =>
  values.map((value, i) => ({ key: i, value, hide: false, data: [] }));

// Regression test: with no `.defined()`, a null value put NaN into the path, and browsers stop
// drawing a path at its first parse error - so everything after the gap disappeared.
describe('line / area generators with missing values', () => {
  it('leaves a gap in the line rather than a NaN', () => {
    const path = buildLineGenerator(PcacFormatEnum.None, scales)(points([10, null, 30])) ?? '';

    expect(path).not.toContain('NaN');
    expect(path.match(/M/g)).toHaveLength(2);
  });

  it('leaves a gap in the area rather than a NaN', () => {
    const path = buildAreaGenerator(PcacFormatEnum.None, scales, 200)(points([10, 20, null, 30, 40])) ?? '';

    expect(path).not.toContain('NaN');
    expect(path.match(/M/g)).toHaveLength(2);
  });
});
