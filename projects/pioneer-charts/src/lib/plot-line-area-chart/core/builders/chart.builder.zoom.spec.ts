import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacFormatEnum } from '../../../core/chart.model';

/** Same technique as chart.builder.point-image.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function config(xFormat: PcacFormatEnum, zoom: Partial<PcacLineAreaChartConfig> = {}): PcacLineAreaChartConfig {
  return {
    ...new PcacLineAreaChartConfig(),
    enableEffects: false,
    enableZoomX: true,
    ...zoom,
    xAxis: { format: xFormat, domainMin: '2024-01-01T00:00:00Z', domainMax: '2024-01-31T00:00:00Z' },
    yAxis: { domainMin: 0, domainMax: 100 },
    // Deliberately not evenly spaced, so index-based and date-based x positions differ.
    data: [{ key: 's', value: null, hide: false, data: [
      { key: '2024-01-02T00:00:00Z', value: 10, hide: false, data: [] },
      { key: '2024-01-20T00:00:00Z', value: 50, hide: false, data: [] },
      { key: '2024-01-25T00:00:00Z', value: 30, hide: false, data: [] },
    ] }],
  };
}

/** First point's x from a line path ("M<x>,<y>L...") and from the corresponding dot's translate. */
function firstXs(svg: SVGSVGElement): { line: number; dot: number } {
  return { line: firstPoint(svg).line.x, dot: firstPoint(svg).dot.x };
}

/** First point's position from the line path and from the point group's translate. */
function firstPoint(svg: SVGSVGElement): { line: { x: number; y: number }; dot: { x: number; y: number } } {
  const d = svg.querySelector('.line')!.getAttribute('d')!;
  const [, lx, ly] = /^M([-\d.]+),([-\d.]+)/.exec(d)!;
  const t = svg.querySelector('.dots .point')!.getAttribute('transform')!;
  const [, dx, dy] = /translate\(([-\d.]+), ?([-\d.]+)\)/.exec(t)!;
  return { line: { x: Number(lx), y: Number(ly) }, dot: { x: Number(dx), y: Number(dy) } };
}

function zoomTo(builder: PlaChartBuilder, transform: typeof zoomIdentity): void {
  const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
  const onZoom = zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void;
  onZoom({ transform });
}

/** Tick label text of an axis, to see which part of the domain it shows. */
function ticks(svg: SVGSVGElement, axis: 'x' | 'y'): string[] {
  return Array.from(svg.querySelectorAll(`.pcac-${axis}-axis .tick text`)).map((t) => t.textContent ?? '');
}

// Regression test: the zoom handler redrew lines/areas with x = newX(index) while the dots went
// through getXFormat(), so on a DateTime (or Decimal) chart the line and its dots split apart
// the moment the chart was zoomed. Drives the zoom callback directly with a real ZoomTransform:
// d3-zoom's gesture plumbing needs SVG geometry jsdom doesn't have.
describe('PlaChartBuilder zoom', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  it('keeps DateTime lines on their dots after a zoom', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config(PcacFormatEnum.DateTime), PcacLineAreaPlotChartConfigType.Line);
    // (The line's pre-zoom `d` is still its enter-animation start shape - transitions don't run
    // here - so only the dot's pre-zoom position is meaningful as a baseline.)
    const before = firstXs(elm.nativeElement);

    zoomTo(builder, zoomIdentity.translate(-100, 0).scale(3));

    const after = firstXs(elm.nativeElement);
    expect(after.dot).not.toBeCloseTo(before.dot, 5);
    expect(after.line).toBeCloseTo(after.dot, 5);
  });

  describe('y axis (enableZoomY)', () => {
    // The same transform throughout: 3x, panned so the middle of the plot is in view on both
    // axes. Which axes actually follow it is down to the config alone.
    const transform = zoomIdentity.translate(-100, -100).scale(3);

    it('leaves the y axis alone when only enableZoomX is on', () => {
      const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const elm = chartElm();
      builder.buildChart(elm, config(PcacFormatEnum.DateTime), PcacLineAreaPlotChartConfigType.Line);
      const before = firstPoint(elm.nativeElement);
      const yTicks = ticks(elm.nativeElement, 'y');

      zoomTo(builder, transform);

      const after = firstPoint(elm.nativeElement);
      expect(after.dot.x).not.toBeCloseTo(before.dot.x, 5);
      expect(after.dot.y).toBeCloseTo(before.dot.y, 5);
      expect(ticks(elm.nativeElement, 'y')).toEqual(yTicks);
    });

    it('rescales the y axis, and only it, when only enableZoomY is on', () => {
      const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const elm = chartElm();
      builder.buildChart(elm, config(PcacFormatEnum.DateTime, { enableZoomX: false, enableZoomY: true }), PcacLineAreaPlotChartConfigType.Line);
      const before = firstPoint(elm.nativeElement);
      const xTicks = ticks(elm.nativeElement, 'x');
      expect(ticks(elm.nativeElement, 'y')).toEqual(['0', '20', '40', '60', '80', '100']);

      zoomTo(builder, transform);

      const after = firstPoint(elm.nativeElement);
      expect(after.dot.x).toBeCloseTo(before.dot.x, 5);
      expect(after.dot.y).not.toBeCloseTo(before.dot.y, 5);
      // The line follows its dots on y just as it does on x.
      expect(after.line.y).toBeCloseTo(after.dot.y, 5);
      expect(ticks(elm.nativeElement, 'x')).toEqual(xTicks);
      // A single y axis (the old one removed) showing just the part of 0..100 the transform
      // brings into view: plot pixels [0, height] map back to [100/3, (height + 100)/3] of the
      // original range, which runs from 100 at the top to 0 at the bottom.
      expect(elm.nativeElement.querySelectorAll('.pcac-y-axis').length).toBe(1);
      const value = (px: number) => 100 * (1 - px / builder.height);
      const yTicks = ticks(elm.nativeElement, 'y').map(Number);
      expect(yTicks.length).toBeGreaterThan(1);
      expect(Math.min(...yTicks)).toBeGreaterThanOrEqual(value((builder.height + 100) / 3));
      expect(Math.max(...yTicks)).toBeLessThanOrEqual(value(100 / 3));
    });

    it('rescales both axes when both are on', () => {
      const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const elm = chartElm();
      builder.buildChart(elm, config(PcacFormatEnum.DateTime, { enableZoomY: true }), PcacLineAreaPlotChartConfigType.Line);
      const before = firstPoint(elm.nativeElement);

      zoomTo(builder, transform);

      const after = firstPoint(elm.nativeElement);
      expect(after.dot.x).not.toBeCloseTo(before.dot.x, 5);
      expect(after.dot.y).not.toBeCloseTo(before.dot.y, 5);
      expect(after.line.x).toBeCloseTo(after.dot.x, 5);
      expect(after.line.y).toBeCloseTo(after.dot.y, 5);
      // The two axes read different parts of their domains than at 1x
      expect(ticks(elm.nativeElement, 'y')).not.toContain('0');
      expect(ticks(elm.nativeElement, 'y')).not.toContain('100');
    });

    it('redraws the horizontal grid against the zoomed y, underneath everything', () => {
      const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const elm = chartElm();
      builder.buildChart(elm, config(PcacFormatEnum.DateTime, { enableZoomY: true }), PcacLineAreaPlotChartConfigType.Line);
      const svg: SVGSVGElement = elm.nativeElement;
      const ruleYs = (): number[] => Array.from(svg.querySelectorAll('.pcac-grid-horizontal line'))
        .map((l) => Number(l.getAttribute('y1')));
      const before = ruleYs();

      zoomTo(builder, transform);

      expect(svg.querySelectorAll('.pcac-grid-horizontal').length).toBe(1);
      expect(ruleYs()).not.toEqual(before);
      // Every rule still lands on a y tick (d3-axis offsets its ticks by half a pixel for crisp lines).
      const tickYs = Array.from(svg.querySelectorAll('.pcac-y-axis .tick'))
        .map((t) => Number(/translate\(0,([-\d.]+)\)/.exec(t.getAttribute('transform')!)![1]));
      for (const y of ruleYs()) {
        expect(tickYs.some((ty) => Math.abs(ty - y) <= 0.5)).toBe(true);
      }
      expect(svg.querySelector('g')!.firstElementChild!.classList.contains('pcac-grid')).toBe(true);
    });

    it('attaches the zoom behavior when only enableZoomY is on', () => {
      const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const elm = chartElm();
      builder.buildChart(elm, config(PcacFormatEnum.DateTime, { enableZoomX: false, enableZoomY: true }), PcacLineAreaPlotChartConfigType.Line);
      expect(elm.nativeElement.querySelector('rect[pointer-events="all"]')).not.toBeNull();

      const off = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const offElm = chartElm();
      off.buildChart(offElm, config(PcacFormatEnum.DateTime, { enableZoomX: false, enableZoomY: false }), PcacLineAreaPlotChartConfigType.Line);
      expect(offElm.nativeElement.querySelector('rect[pointer-events="all"]')).toBeNull();
    });
  });

  // Regression test: d3's default zoom `extent` is the owning <svg>'s size (plot + margins),
  // wider than the plot-sized `translateExtent`, so its constraint centered the plot in that
  // wider viewport - after any gesture, even back at k = 1, the chart sat shifted right/down by
  // half the margins. The constraint is what d3 runs on every gesture, so drive it directly.
  it('constrains a fully zoomed-out transform back to identity, not to a margin-centered offset', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config(PcacFormatEnum.DateTime), PcacLineAreaPlotChartConfigType.Line);
    const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
    const rect = elm.nativeElement.querySelector('rect')!;
    const extent = (zoom.extent() as (this: Element) => [[number, number], [number, number]]).call(rect);
    const translateExtent = zoom.translateExtent();

    expect(extent).toEqual([[0, 0], [builder.width, builder.height]]);
    expect(extent).toEqual(translateExtent);

    // Simulate d3 nudging the transform off identity and then a gesture zooming all the way out.
    const constrained = zoom.constrain()(zoomIdentity.translate(32, 24), extent, translateExtent);
    expect(constrained.k).toBe(1);
    expect(constrained.x).toBe(0);
    expect(constrained.y).toBe(0);
  });
});
