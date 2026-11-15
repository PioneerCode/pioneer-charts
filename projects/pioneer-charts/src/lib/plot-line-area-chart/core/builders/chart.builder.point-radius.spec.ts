import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacLineChartConfig } from '../../line/line.model';
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

function point(key: number, value: number, extra: Partial<PcacData> = {}): PcacData {
  return { key, value, hide: false, data: [], ...extra };
}

function config(extra: Partial<PcacLineChartConfig> = {}): PcacLineChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    data: [{ key: 'a', value: null, hide: false, data: [point(20, 40), point(50, 60), point(80, 50)] }],
    ...extra,
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Transitions run at zero length, so each one only needs d3's next timer frame (~17ms) to land on
 * its end value; `settle` waits several times that, so a slow CI machine still reads end values
 * rather than a radius mid-tween.
 */
const settle = () => wait(120);

function build(cfg: PcacLineChartConfig): SVGSVGElement {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm();
  builder.buildChart(elm, cfg, PcacLineAreaPlotChartConfigType.Line);
  return elm.nativeElement;
}

const radius = (el: Element | null) => Number(el!.getAttribute('r'));

describe('PlaChartBuilder pointRadius', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.spyOn(TestBed.inject(PcacTransitionService), 'getTransitionDuration').mockReturnValue(0);
    vi.spyOn(PlaChartBuilder.prototype, 'showTooltip').mockImplementation(() => undefined);
    vi.spyOn(PlaChartBuilder.prototype, 'hideTooltip').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  async function hoverRadii(svg: SVGSVGElement): Promise<{ rest: number; hovered: number; after: number }> {
    const point = svg.querySelector('.point')!;
    const dot = point.querySelector('.dot');
    await settle();
    const rest = radius(dot);
    point.dispatchEvent(new MouseEvent('mouseover'));
    await settle();
    const hovered = radius(dot);
    point.dispatchEvent(new MouseEvent('mouseout'));
    await settle();
    return { rest, hovered, after: radius(dot) };
  }

  it('keeps the default dots - 4px, 6px hovered - and no hover targets when it is left out', async () => {
    const svg = build(config());
    expect(await hoverRadii(svg)).toEqual({ rest: 4, hovered: 6, after: 4 });
    expect(svg.querySelectorAll('.dot-hit').length).toBe(0);
  });

  it('draws no dot at rest for 0, but still shows a 4px one while the point is hovered', async () => {
    const svg = build(config({ pointRadius: 0 }));
    expect(await hoverRadii(svg)).toEqual({ rest: 0, hovered: 4, after: 0 });
  });

  it('gives a dot smaller than 4px a transparent 4px hover target at the same spot', () => {
    const svg = build(config({ pointRadius: 2 }));
    const hits = Array.from(svg.querySelectorAll('.dot-hit'));
    expect(hits.length).toBe(3);
    const hit = hits[0];
    expect(radius(hit)).toBe(4);
    expect(hit.getAttribute('fill')).toBe('transparent');
    // Under the dot, in the same point group, so its events are the point's.
    expect(hit.nextElementSibling!.classList.contains('dot')).toBe(true);
    expect(hit.parentElement!.classList.contains('point')).toBe(true);
  });

  it('grows a larger dot to 1.5x on hover, with no hover target', async () => {
    const svg = build(config({ pointRadius: 8 }));
    expect(await hoverRadii(svg)).toEqual({ rest: 8, hovered: 12, after: 8 });
    expect(svg.querySelectorAll('.dot-hit').length).toBe(0);
  });

  it('falls back to the default for a negative or non-numeric radius', async () => {
    expect(await hoverRadii(build(config({ pointRadius: -2 })))).toEqual({ rest: 4, hovered: 6, after: 4 });
    document.body.innerHTML = '';
    expect(await hoverRadii(build(config({ pointRadius: 'big' as unknown as number })))).toEqual({ rest: 4, hovered: 6, after: 4 });
  });

  it('sizes a gauge ring around the hovered size of the dot', () => {
    const svg = build(config({
      pointRadius: 8,
      pointGauge: { gap: 3, width: 2 },
      data: [{ key: 'a', value: null, hide: false, data: [point(50, 50, { gauge: 1 })] }],
    }));
    // Hovered radius 12 + gap 3 + half the 2px width.
    expect(radius(svg.querySelector('.point-gauge-track'))).toBe(16);
  });

  it('places the tooltip beside the hover target when there is one, else beside the dot', () => {
    const anchorOf = (svg: SVGSVGElement) => {
      const showTooltip = vi.mocked(PlaChartBuilder.prototype.showTooltip);
      showTooltip.mockClear();
      svg.querySelector('.point')!.dispatchEvent(new MouseEvent('mouseover'));
      return (showTooltip.mock.calls[0][2] as { anchor: Element }).anchor;
    };
    expect(anchorOf(build(config({ pointRadius: 0 }))).getAttribute('class')).toBe('dot-hit');
    document.body.innerHTML = '';
    expect(anchorOf(build(config())).getAttribute('class')).toBe('dot');
  });

  it("sizes the hover crosshair's rings a pixel outside the hovered dot", () => {
    const ring = (cfg: PcacLineChartConfig) => radius(build({ ...cfg, enableEffects: true }).querySelector('.effect-circle'));
    expect(ring(config())).toBe(7);
    document.body.innerHTML = '';
    expect(ring(config({ pointRadius: 8 }))).toBe(13);
    document.body.innerHTML = '';
    expect(ring(config({ pointRadius: 0 }))).toBe(5);
  });

  it('leaves point images alone', () => {
    const svg = build(config({
      pointRadius: 0,
      data: [{ key: 'a', value: null, hide: false, data: [point(50, 50, { image: 'ball.png' })] }],
    }));
    expect(svg.querySelector('.dot-image')!.getAttribute('width')).toBe('16');
    expect(svg.querySelectorAll('.dot, .dot-hit').length).toBe(0);
  });
});
