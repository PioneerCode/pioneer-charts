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

function config(xFormat: PcacFormatEnum): PcacLineAreaChartConfig {
  return {
    ...new PcacLineAreaChartConfig(),
    enableEffects: false,
    enableZoom: true,
    xFormat,
    yDomainMin: 0,
    yDomainMax: 100,
    xDomainMin: '2024-01-01T00:00:00Z',
    xDomainMax: '2024-01-31T00:00:00Z',
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
  const d = svg.querySelector('.line')!.getAttribute('d')!;
  const line = Number(/^M([-\d.]+),/.exec(d)![1]);
  const t = svg.querySelector('.dots .point')!.getAttribute('transform')!;
  const dot = Number(/translate\(([-\d.]+),/.exec(t)![1]);
  return { line, dot };
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

    const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
    const onZoom = zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void;
    onZoom({ transform: zoomIdentity.translate(-100, 0).scale(3) });

    const after = firstXs(elm.nativeElement);
    expect(after.dot).not.toBeCloseTo(before.dot, 5);
    expect(after.line).toBeCloseTo(after.dot, 5);
  });
});
