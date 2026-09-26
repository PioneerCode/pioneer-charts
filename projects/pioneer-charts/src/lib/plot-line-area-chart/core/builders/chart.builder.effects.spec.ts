import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';
import { PcacTransitionService } from '../../../core/transition.service';

/** Same technique as chart.builder.point-image.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

const points = (...values: number[]): PcacData[] => values.map((value) => ({ key: '', value, hide: false, data: [] }));

function config(overrides: Partial<PcacLineAreaChartConfig> = {}): PcacLineAreaChartConfig {
  return {
    ...new PcacLineAreaChartConfig(),
    enableZoomX: false,
    enableZoomY: false,
    yAxis: { domainMin: 0, domainMax: 100 },
    data: [{ key: 's', value: null, hide: false, data: points(10, 50, 30) }],
    ...overrides,
  };
}

function zoomTo(builder: PlaChartBuilder, transform: typeof zoomIdentity): void {
  const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
  (zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void)({ transform });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('PlaChartBuilder hover effects', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  function build(type: PcacLineAreaPlotChartConfigType, overrides: Partial<PcacLineAreaChartConfig> = {}) {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config({ enableEffects: true, ...overrides }), type);
    return { builder, svg: elm.nativeElement as SVGSVGElement };
  }

  it('draws the crosshair on a line chart', () => {
    const { svg } = build(PcacLineAreaPlotChartConfigType.Line);
    expect(svg.querySelectorAll('.effect-group').length).toBe(1);
  });

  // Regression test: a plot chart built the crosshair too, with no line for it to follow, so its
  // circles showed stacked in the top-left corner of the plot on hover.
  it('draws no crosshair on a plot chart', () => {
    const { svg } = build(PcacLineAreaPlotChartConfigType.Plot);
    expect(svg.querySelector('.effects')).toBeNull();
    expect(svg.querySelector('.effects-canvas')).toBeNull();
  });

  it('zooms a plot chart with enableEffects on without touching the (absent) crosshair', () => {
    const { builder } = build(PcacLineAreaPlotChartConfigType.Plot, { enableZoomX: true });
    expect(() => zoomTo(builder, zoomIdentity.scale(2))).not.toThrow();
  });
});

// Regression test: the line/area's enter transition kept running after a zoom, so a zoom inside
// its first 750ms was overwritten by the rest of the transition - the line slid back to its
// unzoomed shape while the axes and dots stayed zoomed. Runs the real (shortened) transition.
describe('PlaChartBuilder zoom during the enter transition', () => {
  const duration = 200;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.spyOn(TestBed.inject(PcacTransitionService), 'getTransitionDuration').mockReturnValue(duration);
  });

  afterEach(() => vi.restoreAllMocks());

  for (const [type, selector] of [[PcacLineAreaPlotChartConfigType.Line, '.line'], [PcacLineAreaPlotChartConfigType.Area, '.area']] as const) {
    it(`keeps the zoomed ${selector.slice(1)} once the transition would have ended`, async () => {
      const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
      const elm = chartElm();
      builder.buildChart(elm, config({ enableEffects: false, enableZoomX: true }), type);
      const path = (elm.nativeElement as SVGSVGElement).querySelector(selector)!;

      await wait(duration / 4);
      zoomTo(builder, zoomIdentity.translate(-200, 0).scale(3));
      const zoomed = path.getAttribute('d');
      await wait(duration * 2);

      expect(path.getAttribute('d')).toBe(zoomed);
    });
  }

  it('still colors an interrupted line', async () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config({ enableEffects: false, enableZoomX: true, colorOverride: ['#ff0000'] }), PcacLineAreaPlotChartConfigType.Line);

    zoomTo(builder, zoomIdentity.scale(2));

    expect((elm.nativeElement as SVGSVGElement).querySelector('.line')!.getAttribute('stroke')).toBe('#ff0000');
  });
});

// Regression test: with points positioned by index (the default), the x domain was taken from the
// first series alone - so an empty (or shorter) first series gave [0, -1] (or too short a domain),
// and the other series' points landed off the plot.
describe('PlaChartBuilder index x axis', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  it('spans the longest series when the first is empty', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config({
      xAxis: { format: PcacFormatEnum.DatasetLength },
      data: [
        { key: 'empty', value: null, hide: false, data: [] },
        { key: 'full', value: null, hide: false, data: points(10, 20, 30, 40, 50) },
      ],
    }), PcacLineAreaPlotChartConfigType.Plot);

    const xs = Array.from((elm.nativeElement as SVGSVGElement).querySelectorAll('.point'))
      .map((p) => Number(/translate\(([-\d.]+)/.exec(p.getAttribute('transform')!)![1]));
    expect(xs.length).toBe(5);
    expect(xs[0]).toBe(0);
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i]).toBeGreaterThan(xs[i - 1]);
    }
    const hidden = Array.from((elm.nativeElement as SVGSVGElement).querySelectorAll('.point'))
      .filter((p) => p.getAttribute('display') === 'none');
    expect(hidden).toEqual([]);
  });
});
