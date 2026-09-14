import { TestBed } from '@angular/core/testing';
import { scaleBand, scaleLinear } from 'd3-scale';
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

  // A category axis has no ticks(); its grid is one line through the middle of each band.
  it('a band scale gets one rule per category, centered in the band', () => {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const svg = select(svgEl).append('g');
    const band = scaleBand<string>().domain(['a', 'b', 'c']).range([0, 300]).padding(0.2);
    const linear = scaleLinear().domain([0, 100]).range([200, 0]);
    TestBed.inject(PcacGridBuilder).drawVerticalGrid({ svg, width: 300, height: 200, xScale: band, yScale: linear, numberOfTicks: 99 });
    const xs = [...svgEl.querySelectorAll('.pcac-grid-rule')].map(g => g.getAttribute('transform'));
    expect(xs).toEqual(['a', 'b', 'c'].map(d => `translate(${band(d)! + band.bandwidth() / 2}, 0)`));
  });
});
