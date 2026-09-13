import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { PcacBarVerticalChartConfig } from './bar-vertical-chart.model';

/**
 * Same technique as core/chart.spec.ts: a real jsdom `<svg>` with stubbed parent metrics, since
 * `initializeChartState` needs a genuine node to run `d3.select(...)` on.
 */
function chartElm(width = 800, height = 0): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(parent, 'clientHeight', { value: height, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function config(overrides: Partial<PcacBarVerticalChartConfig> = {}): PcacBarVerticalChartConfig {
  return {
    ...new PcacBarVerticalChartConfig(),
    height: 200,
    domainMax: 100,
    data: [
      { key: 'Group A', value: null, hide: false, data: [
        { key: 'zero', value: 0, hide: false, data: [] },
        { key: 'full', value: 100, hide: false, data: [] },
      ] },
    ],
    ...overrides,
  };
}

describe('BarVerticalChartBuilder', () => {
  let builder: BarVerticalChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new BarVerticalChartBuilder());
  });

  // Regression test: the y scale was built from `config.height`, while the axis, grid and bar
  // baselines used the resolved `this.height`. Without heightFull the two are equal; with it the
  // scale stopped at config.height and every bar ran on down to the real baseline.
  describe('y scale with heightFull', () => {
    it('spans the resolved (filled) height, so a 0 value sits on the baseline', () => {
      const elm = chartElm(800, 500);
      builder.buildChart(elm, config({ heightFull: true }));
      const yScale = (builder as unknown as { yScale: (v: number) => number }).yScale;

      expect(builder.height).toBeGreaterThan(200);
      expect(yScale(0)).toBe(builder.height);
      expect(yScale(100)).toBe(0);
    });

    it('still spans config.height without heightFull', () => {
      builder.buildChart(chartElm(800, 500), config());
      const yScale = (builder as unknown as { yScale: (v: number) => number }).yScale;

      expect(builder.height).toBe(200);
      expect(yScale(0)).toBe(200);
    });
  });

  // Regression test: `colorOverride.colors.reverse()` reversed the consumer's array in place, so
  // every rebuild (every container resize) flipped their palette back and forth.
  describe('colorOverride', () => {
    it('applies the override reversed without mutating the consumer array, on repeated builds', () => {
      const colors = ['#111', '#222', '#333'];
      const cfg = config({ colorOverride: { colors } });

      builder.buildChart(chartElm(), cfg);
      builder.buildChart(chartElm(), cfg);

      expect(colors).toEqual(['#111', '#222', '#333']);
      expect(builder.colors).toEqual(['#333', '#222', '#111']);
    });
  });
});
