import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
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

  // Regression test: hiding an axis used to add the margins onto the consumer's own
  // `config.height`, and zero the builder's margins for good - so once a chart had rendered
  // with the axis hidden, turning it back on drew the axes with no room for them.
  describe('axis hide', () => {
    it('does not mutate the consumer config', () => {
      const cfg = config({ yAxis: { hide: true } });
      builder.buildChart(chartElm(), cfg);
      expect(cfg.height).toBe(200);
    });

    it('hiding the y axis gives back the left and top margins, keeping the x axis and its margin', () => {
      builder.buildChart(chartElm(), config({ yAxis: { hide: true } }));
      expect(builder.margin).toEqual({ top: 0, right: 16, bottom: 20, left: 0 });
      // the reclaimed top margin goes to the plot, so the SVG's total height is unchanged
      expect(builder.height).toBe(208);
      expect(builder.svg.select('.pcac-y-axis').empty()).toBe(true);
      expect(builder.svg.select('.pcac-x-axis').empty()).toBe(false);
    });

    it('hiding both axes zeroes every margin and hands them all to the plot', () => {
      builder.buildChart(chartElm(), config({ xAxis: { hide: true }, yAxis: { hide: true } }));
      expect(builder.margin).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(builder.height).toBe(228);
    });

    it('restores the default margins when a later build turns the axis back on', () => {
      builder.buildChart(chartElm(), config({ xAxis: { hide: true }, yAxis: { hide: true } }));
      builder.buildChart(chartElm(), config());
      expect(builder.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
    });
  });

  describe('grid', () => {
    it('draws the y axis grid by default and hides it with yAxis.hideGrid', () => {
      builder.buildChart(chartElm(), config());
      expect(builder.svg.select('.pcac-grid').empty()).toBe(false);

      builder.buildChart(chartElm(), config({ yAxis: { hideGrid: true } }));
      expect(builder.svg.select('.pcac-grid').empty()).toBe(true);
    });
  });

  // `isStacked` used to draw every bar from the baseline at its own value, so a "stack" was
  // really overlapping bars that only looked right with pre-accumulated, descending data. Bars
  // now stack: each starts where the previous one in its group ends, in data order.
  describe('isStacked', () => {
    it('stacks each bar on top of the previous one in its group', async () => {
      // Let the enter transition finish instantly so the final geometry can be read back.
      vi.spyOn(builder.transitionService, 'getTransitionDuration').mockReturnValue(0);
      const elm = chartElm(800, 0);
      builder.buildChart(elm, config({
        isStacked: true,
        domainMax: 100,
        data: [{ key: 'G', value: null, hide: false, data: [
          { key: 'a', value: 10, hide: false, data: [] },
          { key: 'b', value: 20, hide: false, data: [] },
          { key: 'c', value: 30, hide: false, data: [] },
        ] }],
      }));
      await new Promise((resolve) => setTimeout(resolve, 50));

      // height 200 / domain 100 -> 2px per unit, y measured from the top.
      const bars = Array.from(elm.nativeElement.querySelectorAll('.pcac-bar') as NodeListOf<SVGRectElement>)
        .map((r) => ({ y: Number(r.getAttribute('y')), h: Number(r.getAttribute('height')) }));
      expect(bars).toEqual([
        { y: 200 - 20, h: 20 },        // a: 0..10
        { y: 200 - 60, h: 40 },        // b: 10..30
        { y: 200 - 120, h: 60 },       // c: 30..60
      ]);
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

  // A longer tick pushes its labels outward by the extra length; the margin has to grow by the same
  // amount (and the plot area shrink) or they land outside the SVG.
  describe('tick size margins', () => {
    it('reserves the extra tick length in the margins and shrinks the plot area to match', () => {
      builder.buildChart(chartElm(800, 500), config());
      const defaultWidth = builder.width;

      builder.buildChart(chartElm(800, 500), config({ xAxis: { tickSize: 16 }, yAxis: { tickSize: 26 } }));

      expect(builder.margin.bottom).toBe(30);
      expect(builder.margin.left).toBe(60);
      expect(builder.width).toBe(defaultWidth - 20);
      expect(builder.height).toBe(200 - 10);
    });

    it('does not carry the reserved margin into a later build without a tick size', () => {
      builder.buildChart(chartElm(800, 500), config({ xAxis: { tickSize: 16 }, yAxis: { tickSize: 26 } }));
      builder.buildChart(chartElm(800, 500), config());

      expect(builder.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
    });
  });
});
