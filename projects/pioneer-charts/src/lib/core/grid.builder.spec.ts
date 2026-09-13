import { TestBed } from '@angular/core/testing';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { PcacGridBuilder } from './grid.builder';

// Regression test: drawVerticalGrid() hard-coded `.ticks(5)` while the axis it sits under used
// `numberOfTicks`, so any chart with numberOfTicks != 5 got grid lines that didn't line up with
// its ticks.
describe('PcacGridBuilder', () => {
  function ruleCount(draw: 'drawVerticalGrid' | 'drawHorizontalGrid', numberOfTicks: number): number {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const svg = select(svgEl).append('g');
    const scale = scaleLinear().domain([0, 100]).range([0, 500]);
    TestBed.inject(PcacGridBuilder)[draw]({ svg, width: 500, height: 200, xScale: scale, yScale: scale, numberOfTicks });
    return svgEl.querySelectorAll('.pcac-grid-rule').length;
  }

  it('vertical grid draws one rule per requested tick', () => {
    // d3's ticks(n) picks "nice" values, so compare against the scale's own answer, not n.
    expect(ruleCount('drawVerticalGrid', 10)).toBe(scaleLinear().domain([0, 100]).ticks(10).length);
    expect(ruleCount('drawVerticalGrid', 2)).toBe(scaleLinear().domain([0, 100]).ticks(2).length);
  });

  it('horizontal grid draws one rule per requested tick', () => {
    expect(ruleCount('drawHorizontalGrid', 10)).toBe(scaleLinear().domain([0, 100]).ticks(10).length);
  });
});
