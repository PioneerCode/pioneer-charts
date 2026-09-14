import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BarHorizontalChartBuilder } from './bar-horizontal-chart.builder';
import { PcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';

/**
 * Same technique as core/chart.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`,
 * since `initializeChartState` needs a genuine node to run `d3.select(...)` on.
 */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function config(): PcacBarHorizontalChartConfig {
  return {
    height: 200,
    domainMax: 100,
    isStacked: false,
    thresholds: [],
    tickFormat: undefined as unknown as PcacBarHorizontalChartConfig['tickFormat'],
    spreadColorsPerGroup: false,
    colorOverride: { colors: [] },
    data: [
      { key: 'Group A', value: null, hide: false, data: [{ key: 'Bar 1', value: 10, hide: false, data: [] }] },
    ],
  };
}

describe('BarHorizontalChartBuilder', () => {
  let builder: BarHorizontalChartBuilder;
  let elm: ElementRef;

  // jsdom doesn't implement SVGGraphicsElement.getBBox() either - buildChart() (via
  // PcacChart.setHorizontalMarginsBasedOnContent) calls it on dynamically-created axis tick
  // <text> elements to size the left margin around bar labels, so it needs a real implementation
  // here, not per-element stubs like chart.spec.ts/effects.builders.spec.ts use elsewhere.
  beforeAll(() => {
    (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () =>
      ({ x: 0, y: 0, width: 40, height: 12 }) as DOMRect;
  });

  afterAll(() => {
    delete (SVGElement.prototype as unknown as { getBBox?: () => DOMRect }).getBBox;
  });

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new BarHorizontalChartBuilder());
    elm = chartElm();
    builder.buildChart(elm, config());
  });

  // Regression test: the mouseover/mouseout handlers on each bar mixed up the D3 event callback's
  // `this` (the raw DOM element, per `function (this: any, ...)`) with `self` (the captured
  // `BarHorizontalChartBuilder` instance) — `this.transitionService` is undefined on a DOM
  // element, and `select(this.transition()...)` called `.transition()` directly on the raw
  // element (which has no such method) instead of wrapping it in `select(this)` first. Both threw
  // the moment a user hovered a bar.
  //
  // Per spec (and jsdom, correctly matching it), an event listener's exception does NOT propagate
  // back through dispatchEvent()'s own call stack — the browser/jsdom catches it internally and
  // reports it separately (surfacing here as a `window` 'error' event), so `expect(() =>
  // dispatchEvent(...)).toThrow()` can never observe it; only listening for that event can.
  function dispatchAndCaptureError(target: Element, type: string): unknown {
    let caught: unknown;
    const onError = (event: ErrorEvent) => { caught = event.error ?? event.message; };
    window.addEventListener('error', onError);
    try {
      target.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    } finally {
      window.removeEventListener('error', onError);
    }
    return caught;
  }

  it('does not throw on mouseover', () => {
    const bar = elm.nativeElement.querySelector('.pcac-bar')!;
    expect(dispatchAndCaptureError(bar, 'mouseover')).toBeUndefined();
  });

  it('does not throw on mouseout', () => {
    const bar = elm.nativeElement.querySelector('.pcac-bar')!;
    dispatchAndCaptureError(bar, 'mouseover');
    expect(dispatchAndCaptureError(bar, 'mouseout')).toBeUndefined();
  });

  // Regression test: the measured label margin was subtracted from a width that
  // initializeChartState had already reduced by margin.left, and because `margin` persists on
  // the builder the double-count grew on the next build - the plot area was too narrow and got
  // narrower after the first resize. With the 40px getBBox stub above and the default 16px right
  // margin, an 800px container must leave exactly 800 - 40 - 16 for the bars, every build.
  it('sizes the plot area from the measured label margin, stably across rebuilds', () => {
    expect(builder.margin.left).toBe(40);
    expect(builder.width).toBe(800 - 40 - 16);

    builder.buildChart(elm, config());

    expect(builder.margin.left).toBe(40);
    expect(builder.width).toBe(800 - 40 - 16);
  });

  // Margins persist on the builder between builds, so a build with a hidden axis must not leave
  // the next one drawing axes into zeroed margins.
  it('restores the default margins when a later build turns a hidden axis back on', () => {
    // Hiding the x axis gives back bottom and right; the y labels stay, so `left` is still
    // measured from them (40px, per the getBBox stub).
    builder.buildChart(elm, { ...config(), xAxis: { hide: true } });
    expect(builder.margin).toEqual({ top: 8, right: 0, bottom: 0, left: 40 });

    builder.buildChart(elm, config());
    expect(builder.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
  });

  it('hiding the y axis skips the label measurement, so left is 0 rather than the label width', () => {
    builder.buildChart(elm, { ...config(), yAxis: { hide: true } });
    expect(builder.margin).toEqual({ top: 0, right: 16, bottom: 20, left: 0 });
    expect(builder.width).toBe(800 - 16);
    expect(builder.svg.select('.pcac-y-axis').empty()).toBe(true);
  });

  it('draws the x axis grid by default and hides it with xAxis.hideGrid', () => {
    expect(builder.svg.select('.pcac-grid').empty()).toBe(false);

    builder.buildChart(elm, { ...config(), xAxis: { hideGrid: true } });
    expect(builder.svg.select('.pcac-grid').empty()).toBe(true);
  });

  // See the matching test in bar-vertical-chart.builder.spec.ts: stacked bars now start where
  // the previous bar in their group ends instead of all starting at 0.
  it('stacks each bar after the previous one in its group', async () => {
    vi.spyOn(builder.transitionService, 'getTransitionDuration').mockReturnValue(0);
    builder.buildChart(elm, {
      ...config(),
      isStacked: true,
      domainMax: 100,
      data: [{ key: 'G', value: null, hide: false, data: [
        { key: 'a', value: 10, hide: false, data: [] },
        { key: 'b', value: 20, hide: false, data: [] },
        { key: 'c', value: 30, hide: false, data: [] },
      ] }],
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const unit = builder.width / 100;
    const bars = Array.from(elm.nativeElement.querySelectorAll('.pcac-bar') as NodeListOf<SVGRectElement>)
      .map((r) => ({ x: Number(r.getAttribute('x')) / unit, w: Number(r.getAttribute('width')) / unit }));
    expect(bars.map((b) => ({ x: Math.round(b.x), w: Math.round(b.w) }))).toEqual([
      { x: 0, w: 10 },
      { x: 10, w: 20 },
      { x: 30, w: 30 },
    ]);
  });

  // Regression test: `colorOverride.colors.reverse()` reversed the consumer's array in place, so
  // every rebuild (every container resize) flipped their palette back and forth.
  it('applies colorOverride reversed without mutating the consumer array, on repeated builds', () => {
    const colors = ['#111', '#222', '#333'];
    const cfg = { ...config(), colorOverride: { colors } };

    builder.buildChart(elm, cfg);
    builder.buildChart(elm, cfg);

    expect(colors).toEqual(['#111', '#222', '#333']);
    expect(builder.colors).toEqual(['#333', '#222', '#111']);
  });

  // `left` is measured from the y axis's bounding box (a constant 40 under the getBBox stub, so it
  // can't show the tick line growing here); `bottom` is the x axis's and must carry the extra length.
  it('reserves a longer x tick in the bottom margin', () => {
    builder.buildChart(elm, { ...config(), xAxis: { tickSize: 16 } });
    expect(builder.margin.bottom).toBe(30);

    builder.buildChart(elm, config());
    expect(builder.margin.bottom).toBe(20);
  });
});
