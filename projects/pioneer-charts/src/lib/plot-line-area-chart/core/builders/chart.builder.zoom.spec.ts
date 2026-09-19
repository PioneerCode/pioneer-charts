import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacFormatEnum } from '../../../core/chart.model';
import { PcacTooltipBuilder } from '../../../core/tooltip.builder';

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
  // Regression test: getXFormat() checked the key for truthiness, so a Decimal key of 0 read as
  // "no key" and was drawn at pixel 0 regardless of the domain or the zoom - a point on the left
  // edge of a `domainMin: 0` axis stayed pinned to the y axis while everything else panned.
  it('moves a Decimal point with a key of 0 under zoom like any other', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, {
      ...config(PcacFormatEnum.Decimal),
      xAxis: { format: PcacFormatEnum.Decimal, domainMin: -10, domainMax: 10 },
      data: [{ key: 's', value: null, hide: false, data: [{ key: 0, value: 10, hide: false, data: [] }, { key: 5, value: 20, hide: false, data: [] }] }],
    }, PcacLineAreaPlotChartConfigType.Line);
    // Key 0 sits in the middle of a -10..10 domain, not on the axis.
    expect(firstPoint(elm.nativeElement).dot.x).toBeCloseTo(builder.width / 2, 5);

    zoomTo(builder, zoomIdentity.translate(-50, 0));

    expect(firstPoint(elm.nativeElement).dot.x).toBeCloseTo(builder.width / 2 - 50, 5);
  });

  // Regression test: the behavior was `.call()`ed on the capture rect as well as on the chart
  // group, and d3-zoom keeps a transform per element. A wheel over a point (not an ancestor of
  // the rect) advanced only the group's, so once the point had moved out from under the still
  // cursor the next wheel hit the rect, and each tick redrew from the rect's stale transform and
  // then the group's real one - the chart flickered between the two. Only the group carries it.
  it('attaches the zoom behavior to the chart group only, never to the capture rect', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config(PcacFormatEnum.DateTime), PcacLineAreaPlotChartConfigType.Line);
    const svg: SVGSVGElement = elm.nativeElement;
    const zoomed = (node: Element | null) => (node as unknown as { __zoom?: unknown })?.__zoom !== undefined;

    expect(zoomed(svg.querySelector('g'))).toBe(true);
    expect(zoomed(svg.querySelector('rect[pointer-events="all"]'))).toBe(false);
  });

  // Regression test: zoom moves the hovered point out from under a cursor that hasn't moved
  // (or hides it, once it's carried past an edge), so the browser never sends it a mouseout -
  // its tooltip stayed up, and its dot stayed grown, for good.
  describe('hovered point', () => {
    const shell = () => TestBed.inject(PcacTooltipBuilder).tooltip.node() as HTMLDivElement;
    afterEach(() => TestBed.inject(PcacTooltipBuilder).hideTooltip());

    function hovered(): { builder: PlaChartBuilder; elm: ElementRef; point: Element } {
      const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const elm = chartElm();
      builder.buildChart(elm, config(PcacFormatEnum.DateTime), PcacLineAreaPlotChartConfigType.Line);
      const point = elm.nativeElement.querySelector('.dots .point')!;
      point.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      expect(shell().style.display).toBe('inline-block');
      return { builder, elm, point };
    }

    it('has its tooltip closed by a zoom', () => {
      const { builder } = hovered();

      zoomTo(builder, zoomIdentity.translate(-100, 0).scale(3));

      expect(shell().style.display).toBe('none');
    });

    it('has its tooltip closed by a rebuild', () => {
      const { builder, elm } = hovered();

      builder.buildChart(elm, config(PcacFormatEnum.DateTime), PcacLineAreaPlotChartConfigType.Line);

      expect(shell().style.display).toBe('none');
    });

    it('still closes its tooltip on its own mouseout', () => {
      const { point } = hovered();

      point.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

      expect(shell().style.display).toBe('none');
    });
  });

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
