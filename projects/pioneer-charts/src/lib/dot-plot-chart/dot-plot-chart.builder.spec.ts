import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DotPlotChartBuilder } from './dot-plot-chart.builder';
import { PcacDotPlotChartConfig } from './dot-plot-chart.model';
import { PcacData, PcacFormatEnum } from '../core/chart.model';

/** Same technique as the plot chart's builder specs: a laid-out parent with a width. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

const point = (key: string, value: number, extra: Partial<PcacData> = {}): PcacData =>
  ({ key, value, hide: false, data: [], ...extra });

function config(points: PcacData[][], extra: Partial<PcacDotPlotChartConfig> = {}): PcacDotPlotChartConfig {
  return {
    height: 200,
    xAxis: { domainMin: 0, domainMax: 10 },
    data: points.map((p, i) => ({ key: `series ${i}`, value: null, hide: false, data: p })),
    ...extra,
  };
}

function build(cfg: PcacDotPlotChartConfig): { builder: DotPlotChartBuilder; svg: SVGSVGElement } {
  const builder = TestBed.runInInjectionContext(() => new DotPlotChartBuilder());
  const elm = chartElm();
  builder.buildChart(elm, cfg);
  return { builder, svg: elm.nativeElement };
}

function centers(svg: SVGSVGElement): { x: number; y: number }[] {
  return Array.from(svg.querySelectorAll('.pcac-dot-mark')).map((g) => {
    const [, x, y] = /translate\(([-\d.]+), ?([-\d.]+)\)/.exec(g.getAttribute('transform')!)!;
    return { x: Number(x), y: Number(y) };
  });
}

const plot = (builder: DotPlotChartBuilder) => builder as unknown as { width: number; height: number };

describe('DotPlotChartBuilder', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('places each point on the value axis and stacks equal values upward from it', () => {
    const { builder, svg } = build(config([[point('a', 5), point('b', 5), point('c', 10)]]));
    const { width, height } = plot(builder);
    const [a, b, c] = centers(svg);
    expect(a.x).toBe(width / 2);
    expect(b.x).toBe(a.x);
    expect(c.x).toBe(width);
    // A dot is 2 * (6 + 2 hover) = 16px, plus a 2px gap: each level is 18px above the last.
    expect(a.y).toBe(height - 2 - 8);
    expect(a.y - b.y).toBe(18);
  });

  it('draws a dot, or the point\'s image in its place', () => {
    const { svg } = build(config([[point('dot', 2), point('pic', 4, { image: 'ball.png' })]], { pointImage: { maxWidth: 30, maxHeight: 30 } }));
    expect(svg.querySelectorAll('circle.pcac-dot').length).toBe(1);
    const image = svg.querySelector('image.pcac-dot-image')!;
    expect(image.getAttribute('href')).toBe('ball.png');
    expect(image.getAttribute('width')).toBe('30');
  });

  it('shrinks every mark evenly when the tallest column would not fit', () => {
    const tall = Array.from({ length: 30 }, (_, i) => point(`p${i}`, 5));
    const { builder, svg } = build(config([tall], { height: 180 }));
    const ys = centers(svg).map((c) => c.y);
    // The top mark's center is still inside the plot, and every mark is the same distance apart.
    expect(Math.min(...ys)).toBeGreaterThan(0);
    expect(Math.max(...ys)).toBeLessThan(plot(builder).height);
    const r = Number(svg.querySelector('circle.pcac-dot')!.getAttribute('r'));
    expect(r).toBeLessThan(6);
  });

  it('emits the fit it drew at, only when it changes', () => {
    const builder = TestBed.runInInjectionContext(() => new DotPlotChartBuilder());
    const fits: number[] = [];
    builder.markFit$.subscribe((fit) => fits.push(fit));
    const elm = chartElm();
    const tall = config([Array.from({ length: 30 }, (_, i) => point(`p${i}`, 5))], { height: 180 });
    builder.buildChart(elm, config([[point('a', 5)]]));
    builder.buildChart(elm, config([[point('a', 5)]]));
    builder.buildChart(elm, tall);
    expect(fits.length).toBe(2);
    expect(fits[0]).toBe(1);
    // The drawn dot is the full radius scaled by the fit that was emitted.
    const r = Number(elm.nativeElement.querySelector('circle.pcac-dot')!.getAttribute('r'));
    expect(fits[1]).toBeLessThan(1);
    expect(r).toBeCloseTo(6 * fits[1]);
  });

  it('spans the data, rounded out, when the axis has no domain of its own', () => {
    const { builder, svg } = build(config([[point('a', 2.3), point('b', 7.8)]], { xAxis: {} }));
    const [a, b] = centers(svg);
    // Nice ticks round 2.3 - 7.8 out to 2 - 8.
    expect(a.x).toBeCloseTo(plot(builder).width * (0.3 / 6));
    expect(b.x).toBeCloseTo(plot(builder).width * (5.8 / 6));
  });

  it('colors dots by series, with the override when one is given', () => {
    const { svg } = build(config([[point('a', 1)], [point('b', 2)]], { colorOverride: ['tomato', 'teal'] }));
    expect(Array.from(svg.querySelectorAll('circle.pcac-dot')).map((c) => c.getAttribute('stroke'))).toEqual(['tomato', 'teal']);
  });

  it('never draws a y axis', () => {
    const { svg } = build(config([[point('a', 1)]], { yAxis: { hide: false, label: 'Count' } }));
    expect(svg.querySelector('.pcac-y-axis')).toBeNull();
    expect(svg.querySelector('.pcac-x-axis')).not.toBeNull();
  });

  it('names each mark for screen readers by series, key and formatted value', () => {
    const { svg } = build(config([[point('Viking', 0.25)]], { xAxis: { domainMin: 0, domainMax: 1, format: PcacFormatEnum.Percentage } }));
    expect(svg.querySelector('.pcac-dot-mark')!.getAttribute('aria-label')).toBe('series 0, Viking: 25%');
  });

  it('emits the point when a mark is clicked', () => {
    const p = point('a', 1);
    const { builder, svg } = build(config([[p]]));
    let clicked: PcacData | null = null;
    builder.dotClicked$.subscribe((d) => (clicked = d));
    svg.querySelector<SVGGElement>('.pcac-dot-mark')!.dispatchEvent(new MouseEvent('click'));
    expect(clicked).toBe(p);
  });

  it('clears what it drew when the data empties', () => {
    const builder = TestBed.runInInjectionContext(() => new DotPlotChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config([[point('a', 1)]]));
    builder.buildChart(elm, config([]));
    expect(elm.nativeElement.querySelector('.pcac-dot-mark')).toBeNull();
  });

  it('defaults the dot radius and gap when a config leaves them out', () => {
    const { svg } = build(config([[point('a', 5), point('b', 5)]]));
    expect(svg.querySelector('circle.pcac-dot')!.getAttribute('r')).toBe('6');
    const [a, b] = centers(svg);
    expect(a.y - b.y).toBe(18);
  });
});

describe('DotPlotChartBuilder autoTickSize', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  const xTick = (builder: DotPlotChartBuilder) => builder.xAxis.tickSize;

  it('leaves tickSize alone while autoTickSize is off', () => {
    const { builder } = build(config([[point('a', 5)]], { xAxis: { domainMin: 0, domainMax: 10, tickSize: 20 } }));
    expect(xTick(builder)).toBe(20);
  });

  it('sizes the x ticks to half a hovered dot, overriding any tickSize given', () => {
    const { builder, svg } = build(config([[point('a', 5)]], { xAxis: { domainMin: 0, domainMax: 10, autoTickSize: true, tickSize: 20 } }));
    // Radius 6 + 2 hover growth.
    expect(xTick(builder)).toBe(8);
    expect(Math.abs(Number(svg.querySelector('.pcac-x-axis .tick line')!.getAttribute('y2')))).toBe(8);
  });

  it('uses half an image box\'s height when that is the larger mark', () => {
    const { builder } = build(config([[point('dot', 2), point('pic', 4, { image: 'ball.png' })]], {
      xAxis: { domainMin: 0, domainMax: 10, autoTickSize: true }, pointImage: { maxWidth: 30, maxHeight: 21 },
    }));
    expect(xTick(builder)).toBe(11);
  });

  it('measures the marks after shrinking them to fit, never shorter than they reach', () => {
    const column = Array.from({ length: 20 }, (_, i) => point(`p${i}`, 5, { image: 'ball.png' }));
    const { builder, svg } = build(config([column], {
      xAxis: { domainMin: 0, domainMax: 10, autoTickSize: true }, pointImage: { maxWidth: 40, maxHeight: 40 },
    }));
    const half = Number(svg.querySelector('image.pcac-dot-image')!.getAttribute('height')) / 2;
    // Unshrunk this would be 20.
    expect(half).toBeLessThan(10);
    expect(xTick(builder)).toBeGreaterThanOrEqual(half);
    // Rounded up from the size the marks needed a pass earlier, which the last pass can only shrink.
    expect(xTick(builder)! - half).toBeLessThan(1.5);
  });
});
