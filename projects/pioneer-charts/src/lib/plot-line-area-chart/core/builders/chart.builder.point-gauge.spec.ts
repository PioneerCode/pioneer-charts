import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { gaugeFraction } from './point-gauge.builder';
import { PcacLineAreaPlotChartConfigType, PcacPointGaugeConfig } from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig } from '../../plot/plot.model';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';

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

/** One point per series, as the plot chart is usually used. */
function config(points: PcacData[], pointGauge?: Partial<PcacPointGaugeConfig>, extra: Partial<PcacPlotChartConfig> = {}): PcacPlotChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    colorOverride: ['#111111', '#222222', '#333333'],
    pointImage: { maxWidth: 40, maxHeight: 40 },
    ...(pointGauge ? { pointGauge } : {}),
    data: points.map((p, i) => ({ key: `series ${i}`, value: null, hide: false, data: [p] })),
    ...extra,
  };
}

function build(cfg: PcacPlotChartConfig): { builder: PlaChartBuilder; svg: SVGSVGElement } {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm(800);
  builder.buildChart(elm, cfg, PcacLineAreaPlotChartConfigType.Plot);
  return { builder, svg: elm.nativeElement };
}

const gauges = (svg: SVGSVGElement) => Array.from(svg.querySelectorAll<SVGGElement>('.point-gauge'));

describe('PlaChartBuilder point gauges', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('draws nothing while pointGauge is off, even for points with a gauge', () => {
    const { svg } = build(config([point(50, 50, { gauge: 0.5 })]));
    expect(gauges(svg)).toEqual([]);
  });

  it('rings only the points that have a gauge, hidden from screen readers', () => {
    const { svg } = build(config([point(20, 50, { gauge: 0.5 }), point(80, 50)], {}));
    expect(gauges(svg).length).toBe(1);
    expect(gauges(svg)[0].closest('.point')!.querySelector('.dot')).not.toBeNull();
    expect(gauges(svg)[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('sizes the ring around a hovered dot or an image box, gap and half its width beyond it', () => {
    const { svg } = build(config(
      [point(20, 50, { gauge: 1 }), point(80, 50, { gauge: 1, image: 'ball.png' })],
      { gap: 3, width: 2 },
    ));
    const radii = gauges(svg).map((g) => Number(g.querySelector('.point-gauge-track')!.getAttribute('r')));
    // Dot: hovered radius 6 + gap 3 + 1. Image: half the 40px box + 3 + 1.
    expect(radii).toEqual([10, 24]);
    expect(gauges(svg)[0].querySelector('.point-gauge-track')!.getAttribute('stroke-width')).toBe('2');
  });

  it('fills the arc as a share of max, and leaves an empty ring for zero', () => {
    expect(gaugeFraction(0.01, 0.02)).toBe(0.5);
    expect(gaugeFraction(0.05, 0.02)).toBe(1);
    expect(gaugeFraction(-1, 0.02)).toBe(0);
    expect(gaugeFraction(1, 0)).toBe(0);

    const { svg } = build(config([point(20, 50, { gauge: 0.01 }), point(80, 50, { gauge: 0 })], { max: 0.02 }));
    const [half, empty] = gauges(svg).map((g) => g.querySelector('.point-gauge-arc')!);
    expect(half.getAttribute('d')).toBeTruthy();
    expect(empty.hasAttribute('d')).toBe(false);
  });

  it('leaves the track out when showTrack is off', () => {
    const { svg } = build(config([point(50, 50, { gauge: 0.5 })], { showTrack: false }));
    expect(svg.querySelector('.point-gauge-track')).toBeNull();
    expect(svg.querySelector('.point-gauge-arc')).not.toBeNull();
  });

  it("colors each arc its series' color unless the config sets one, and the track likewise", () => {
    const plain = build(config([point(20, 50, { gauge: 0.5 }), point(80, 50, { gauge: 0.5 })], {})).svg;
    expect(gauges(plain).map((g) => g.style.getPropertyValue('--pcac-point-gauge-series-color'))).toEqual(['#111111', '#222222']);
    expect(plain.querySelector<SVGGElement>('.dots')!.style.getPropertyValue('--pcac-point-gauge-color')).toBe('');

    const set = build(config([point(50, 50, { gauge: 0.5 })], { color: 'tomato', trackColor: 'wheat' })).svg;
    const dots = set.querySelector<SVGGElement>('.dots')!;
    expect(dots.style.getPropertyValue('--pcac-point-gauge-color')).toBe('tomato');
    expect(dots.style.getPropertyValue('--pcac-point-gauge-track-color')).toBe('wheat');
  });

  it("adds the gauge to a point's screen reader name when it's given a name", () => {
    const named = build(config([point(50, 50, { gauge: 0.018 }), point(60, 50)], { name: 'PSA' })).svg;
    const labels = Array.from(named.querySelectorAll('.point')).map((p) => p.getAttribute('aria-label'));
    expect(labels[0]).toMatch(/, PSA 0\.018$/);
    expect(labels[1]).not.toContain('PSA');

    const unnamed = build(config([point(50, 50, { gauge: 0.018 })], {})).svg;
    expect(unnamed.querySelector('.point')!.getAttribute('aria-label')).not.toContain('0.018');
  });

  it('grows the edge space by the ring, for images and dots alike', () => {
    const image = build(config([point(50, 50, { gauge: 0.5, image: 'ball.png' })], { gap: 3, width: 2 })).builder;
    const noRing = build(config([point(50, 50, { image: 'ball.png' })], { gap: 3, width: 2 })).builder;
    expect(image.margin.top - noRing.margin.top).toBe(5);

    const dot = build(config([point(50, 50, { gauge: 0.5 })], { gap: 3, width: 2 })).builder;
    // A hovered dot (6) plus the ring (5).
    expect(dot.margin.top).toBeGreaterThanOrEqual(11);
  });

  // Regression: the edge space was the box's own side plus the ring, but the ring is drawn around
  // the box's larger side - a 40x20 image's ring reaches 25px above its point, and the SVG cut the
  // top 10px of it off.
  it('makes room for a ring around a wide image on every side, not just the box\'s own height', () => {
    const { builder, svg } = build(config([point(50, 100, { gauge: 0.5, image: 'ball.png' })], { gap: 3, width: 2 }, {
      pointImage: { maxWidth: 40, maxHeight: 20 },
    }));
    const ringReach = Number(svg.querySelector('.point-gauge-track')!.getAttribute('r')) + 1;
    expect(ringReach).toBe(25);
    expect(builder.margin.top).toBeGreaterThanOrEqual(ringReach);
    expect(builder.margin.bottom).toBeGreaterThanOrEqual(ringReach);
  });

  it('spaces fanned-out points far enough apart for their rings', () => {
    const shared = [1, 2].map((i) => point(50, 50, { gauge: 0.5, image: `${i}.png` }));
    const spread = (pointGauge?: Partial<PcacPointGaugeConfig>) => {
      const { svg } = build(config(shared, pointGauge, { pointFanOut: { gap: 4 } }));
      const ys = Array.from(svg.querySelectorAll('line.fan-out-spoke')).map((s) => Number(s.getAttribute('y2')));
      return Math.abs(ys[1] - ys[0]);
    };
    // A pair sits straight up and down: image boxes 40 + gap 4 apart, plus a 5px ring each side.
    expect(spread({ gap: 3, width: 2 }) - spread()).toBe(10);
  });
});
