import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PcacChart } from './chart';
import { PcacChartConfig } from './chart.model';

/**
 * Builds an `ElementRef` around a real (jsdom) `<svg>` whose parent's `clientWidth` reports
 * `width`. Needs to be a real node, not a bare stub object: `initializeChartState` runs it
 * through `d3.select(...).select('g').remove()` before ever measuring anything. jsdom doesn't
 * do layout, so `clientWidth` is stubbed directly rather than produced by real box metrics.
 */
function chartElm(width: number): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  return { nativeElement: svg } as ElementRef;
}

function config(height = 200): PcacChartConfig {
  return { height, data: [{ key: 'a', value: 1, hide: false, data: [] }] };
}

describe('PcacChart', () => {
  let chart: PcacChart;

  beforeEach(() => {
    // PcacChart's fields are `inject()`ed at field-initializer time, so it needs an active
    // injection context - same requirement its real subclasses (BarVerticalChartBuilder, etc.)
    // get for free from being constructed via Angular's `providers: [...]`.
    chart = TestBed.runInInjectionContext(() => new PcacChart());
  });

  describe('initializeChartState', () => {
    it('returns false and leaves state untouched when the container has not been laid out yet (clientWidth 0)', () => {
      const widthBefore = chart.width;
      const result = chart.initializeChartState(chartElm(0), config());

      expect(result).toBe(false);
      expect(chart.width).toBe(widthBefore);
    });

    it('returns false when clientWidth is smaller than the margins alone', () => {
      // margin.left(40) + margin.right(16) = 56; a 40px container computes a negative width.
      const result = chart.initializeChartState(chartElm(40), config());
      expect(result).toBe(false);
    });

    it('returns true and sets width/height/colors when the container has a real size', () => {
      const result = chart.initializeChartState(chartElm(800), config(321));

      expect(result).toBe(true);
      expect(chart.width).toBe(800 - chart.margin.left - chart.margin.right);
      expect(chart.height).toBe(321);
      expect(chart.colors.length).toBeGreaterThan(0);
    });
  });

  describe('containerSizeChanged', () => {
    it('returns true before any successful build has happened', () => {
      expect(chart.containerSizeChanged(chartElm(800))).toBe(true);
    });

    it('returns false once the container is measured again at the same width', () => {
      chart.initializeChartState(chartElm(800), config());
      expect(chart.containerSizeChanged(chartElm(800))).toBe(false);
    });

    it('returns true when the container has genuinely resized', () => {
      chart.initializeChartState(chartElm(800), config());
      expect(chart.containerSizeChanged(chartElm(600))).toBe(true);
    });

    it('returns true if the container measures 0 again (still not laid out / hidden)', () => {
      // Only relevant pre-first-build, but guard the degenerate case regardless: a still-0
      // measurement should never read as "unchanged, skip".
      expect(chart.containerSizeChanged(chartElm(0))).toBe(true);
    });

    // Regression test: bar-horizontal-chart's setHorizontalMarginsBasedOnContent() recomputes
    // `width` and overwrites `margin.left` *after* initializeChartState(), based on measured
    // axis-label widths. containerSizeChanged() must keep comparing against the container's raw
    // measured width, not `width`/`margin` - otherwise it permanently reads "changed" for any
    // chart whose builder adjusts margins mid-build, causing an extra rebuild on every load
    // (see PcacChartResizeService's first, guaranteed ResizeObserver callback).
    it('is unaffected by a builder mutating width/margin.left after a successful build', () => {
      chart.initializeChartState(chartElm(800), config());
      const widthAfterInit = chart.width;

      // Simulate bar-horizontal-chart's mid-build margin recalculation.
      chart.margin.left = 90;
      chart.width = chart.width - 90;

      expect(chart.width).not.toBe(widthAfterInit);
      expect(chart.containerSizeChanged(chartElm(800))).toBe(false);
    });
  });
});
