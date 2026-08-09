import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
    numberOfTicks: 5,
    isStacked: false,
    thresholds: [],
    tickFormat: undefined as unknown as PcacBarHorizontalChartConfig['tickFormat'],
    hideGrid: false,
    hideAxis: false,
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
});
