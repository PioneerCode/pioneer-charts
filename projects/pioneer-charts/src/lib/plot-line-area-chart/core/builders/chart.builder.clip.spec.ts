import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';

/** Same technique as core/chart.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function config(): PcacLineAreaChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    xAxis: { domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    colorOverride: [],
    data: [
      { key: '', value: null, hide: false, data: [{ key: 0, value: 1, hide: false, data: [] }, { key: 1, value: 2, hide: false, data: [] }] },
    ],
  };
}

// Regression test: dots at the x-domain's minimum or maximum sit exactly on the chart's
// clip-path boundary (a <rect> spanning [0, width]) - since a dot has a nonzero radius, half of
// it (left half at the minimum, right half at the maximum) used to fall outside that boundary
// and get clipped away. The vertical dimension already carries a 10px buffer on each side for
// the identical reason (see the .attr('y', -10)/.attr('height', height + 20) below it); the
// horizontal dimension needs the same treatment. (This is the points' clip-path, the first one
// in the SVG; the second, for lines/areas/fan-outs, hugs the plot - see the point-image spec.)
describe('PlaChartBuilder clip-path', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  it('extends the clip-path rect horizontally beyond [0, width], matching its existing vertical buffer', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm(800);
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Line);

    const clipRect = elm.nativeElement.querySelector('clipPath rect')!;
    const x = Number(clipRect.getAttribute('x'));
    const width = Number(clipRect.getAttribute('width'));
    const y = Number(clipRect.getAttribute('y'));
    const height = Number(clipRect.getAttribute('height'));

    expect(x).toBeLessThan(0);
    expect(width).toBeGreaterThan(builder.width);
    // The rect's right edge (x + width) must clear the chart's full drawable width, not just be
    // wider in the abstract - a positive x with an unchanged width would still clip the right edge.
    expect(x + width).toBeGreaterThan(builder.width);

    // Same buffer amount on both axes, mirroring the vertical treatment this was modeled on.
    const horizontalBuffer = -x;
    const verticalBuffer = -y;
    expect(horizontalBuffer).toBe(verticalBuffer);
    expect(width - builder.width).toBe(height - builder.height);
  });
});

// Regression test: the clip-path ids were a timestamp plus a random number, which two charts
// rebuilding in the same millisecond could share - and `url(#id)` resolves to the first match in
// the page, so one chart was clipped with the other's rect.
describe('PlaChartBuilder clip-path ids', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  const ids = (elm: ElementRef) => Array.from(elm.nativeElement.querySelectorAll('clipPath') as NodeListOf<Element>).map((c) => c.id);

  it('never shares an id with another chart, even building in the same millisecond', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const first = chartElm();
    const second = chartElm();
    TestBed.runInInjectionContext(() => new PlaChartBuilder()).buildChart(first, config(), PcacLineAreaPlotChartConfigType.Line);
    TestBed.runInInjectionContext(() => new PlaChartBuilder()).buildChart(second, config(), PcacLineAreaPlotChartConfigType.Line);
    vi.restoreAllMocks();

    expect(ids(first).length).toBe(2);
    expect(ids(first).filter((id) => ids(second).includes(id))).toEqual([]);
  });

  it('keeps its ids across rebuilds, with only one set in the page', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Line);
    const before = ids(elm);
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Line);

    expect(ids(elm)).toEqual(before);
  });
});

// Regression test: the line left a gap at a point whose value was an empty string (`hasValue`),
// but the scale read `''` as 0, so its dot was still drawn - and hoverable - on the baseline.
describe('PlaChartBuilder points without a value', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  it('draws no dot for an empty-string value', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    const cfg = config();
    cfg.data[0].data.push({ key: 2, value: '', hide: false, data: [] });
    builder.buildChart(elm, cfg, PcacLineAreaPlotChartConfigType.Plot);

    const displays = Array.from(elm.nativeElement.querySelectorAll('.point') as NodeListOf<Element>).map((p) => p.getAttribute('display'));
    expect(displays).toEqual([null, null, 'none']);
  });
});
