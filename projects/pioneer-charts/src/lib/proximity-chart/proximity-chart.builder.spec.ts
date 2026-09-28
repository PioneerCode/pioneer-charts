import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProximityChartBuilder } from './proximity-chart.builder';
import { PcacProximityChartConfig } from './proximity-chart.model';
import { PcacData, PcacFormatEnum } from '../core/chart.model';

/** Same technique as the other builders' specs: a laid-out parent with a width. */
function chartElm(width = 600): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

const item = (key: string, value: number, extra: Partial<PcacData> = {}): PcacData =>
  ({ key, value, hide: false, data: [], ...extra });

function config(data: PcacData[], extra: Partial<PcacProximityChartConfig> = {}): PcacProximityChartConfig {
  return {
    height: 400,
    center: { key: 'Viking', value: null, hide: false, data: [], image: 'viking.png' },
    data,
    ...extra,
  };
}

function build(cfg: PcacProximityChartConfig): { builder: ProximityChartBuilder; svg: SVGSVGElement } {
  const builder = TestBed.runInInjectionContext(() => new ProximityChartBuilder());
  const elm = chartElm();
  builder.buildChart(elm, cfg);
  return { builder, svg: elm.nativeElement };
}

function positions(svg: SVGSVGElement): { x: number; y: number }[] {
  return Array.from(svg.querySelectorAll('.pcac-proximity-item:not(.pcac-proximity-center)')).map((g) => {
    const [, x, y] = /translate\(([-\d.e]+), ?([-\d.e]+)\)/.exec(g.getAttribute('transform')!)!;
    return { x: Number(x), y: Number(y) };
  });
}

const radius = (p: { x: number; y: number }) => Math.hypot(p.x, p.y);

describe('ProximityChartBuilder', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('draws the center in the middle and each item around it, closer in for a closer value', () => {
    const { svg } = build(config([item('close', 0.95), item('far', 0.5)]));
    const center = svg.querySelector('.pcac-proximity-center')!;
    expect(center.getAttribute('transform')).toBe('translate(0, 0)');
    expect(center.querySelector('image')!.getAttribute('href')).toBe('viking.png');
    const [close, far] = positions(svg);
    expect(radius(close)).toBeLessThan(radius(far));
    // The first item sits at 12 o'clock, straight above the center.
    expect(close.x).toBeCloseTo(0);
    expect(close.y).toBeLessThan(0);
  });

  it('keeps every item clear of the center and inside the chart', () => {
    const { builder, svg } = build(config([item('same', 1), item('none', 0)], { centerSize: 60, itemSize: 30 }));
    const { width, height } = builder as unknown as { width: number; height: number };
    const [same, none] = positions(svg).map(radius);
    expect(same).toBeGreaterThanOrEqual(30 + 15);
    expect(none + 15).toBeLessThanOrEqual(Math.min(width, height) / 2);
  });

  it('reads the scale the other way round for a distance', () => {
    const { svg } = build(config([item('near', 2), item('far', 18)], { closeValue: 0, farValue: 20 }));
    const [near, far] = positions(svg).map(radius);
    expect(near).toBeLessThan(far);
  });

  it('draws guide rings labelled in the chart format', () => {
    const { svg } = build(config([item('a', 0.9)], { rings: [0.9, 0.8], format: PcacFormatEnum.Percentage }));
    const labels = Array.from(svg.querySelectorAll('.pcac-proximity-ring-label')).map((t) => t.textContent);
    expect(labels).toEqual(['90%', '80%']);
    expect(svg.querySelector('.pcac-proximity-rings')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws a spoke to each item unless turned off', () => {
    expect(build(config([item('a', 0.9), item('b', 0.8)])).svg.querySelectorAll('.pcac-proximity-spoke').length).toBe(2);
    expect(build(config([item('a', 0.9)], { showSpokes: false })).svg.querySelector('.pcac-proximity-spoke')).toBeNull();
  });

  it('draws an item without an image as a dot in its color', () => {
    const { svg } = build(config([item('a', 0.9)], { colorOverride: ['navy', 'tomato'] }));
    const dot = svg.querySelector('.pcac-proximity-item:not(.pcac-proximity-center) .pcac-proximity-dot')!;
    expect(dot.getAttribute('fill')).toBe('tomato');
  });

  it('names each item for screen readers with its formatted value, and the center as the center', () => {
    const { svg } = build(config([item('Rockstar', 0.93)], { format: PcacFormatEnum.Percentage }));
    const names = Array.from(svg.querySelectorAll('.pcac-proximity-item')).map((g) => g.getAttribute('aria-label'));
    expect(names).toEqual(['Rockstar: 93%', 'Viking, in the center']);
  });

  it('emits the item, or the center, when clicked', () => {
    const near = item('near', 0.9);
    const { builder, svg } = build(config([near]));
    const clicked: PcacData[] = [];
    builder.itemClicked$.subscribe((d) => clicked.push(d));
    svg.querySelectorAll<SVGGElement>('.pcac-proximity-item').forEach((g) => g.dispatchEvent(new MouseEvent('click')));
    expect(clicked.map((d) => d.key)).toEqual(['near', 'Viking']);
  });

  it('clears what it drew when given nothing to draw', () => {
    const builder = TestBed.runInInjectionContext(() => new ProximityChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config([item('a', 0.9)]));
    builder.buildChart(elm, { height: 400, center: undefined as unknown as PcacData, data: [] });
    expect(elm.nativeElement.querySelector('.pcac-proximity-item')).toBeNull();
  });

  it('writes names under the items and the center only when asked', () => {
    expect(build(config([item('Rockstar', 0.9)])).svg.querySelector('.pcac-proximity-label')).toBeNull();
    const { svg } = build(config([item('Rockstar', 0.9)], { showLabels: true }));
    expect(Array.from(svg.querySelectorAll('.pcac-proximity-label')).map((t) => t.textContent)).toEqual(['Rockstar', 'Viking']);
  });

  it('labels the rings halfway between the first two items, clear of both', () => {
    const { svg } = build(config([item('a', 0.9), item('b', 0.9)], { rings: [0.8] }));
    const label = svg.querySelector('.pcac-proximity-ring-label')!;
    // Two items sit at 12 and 6 o'clock, so the label goes at 3 o'clock: right of center, level with it.
    expect(Number(label.getAttribute('x'))).toBeGreaterThan(0);
    expect(Math.abs(Number(label.getAttribute('y')))).toBeLessThan(0.001);
  });

  it('keeps room for the name under an item on the rim when names are shown', () => {
    const rim = (showLabels: boolean) => {
      const { svg } = build(config([item('far', 0)], { itemSize: 30, showLabels }));
      return radius(positions(svg)[0]);
    };
    expect(rim(false) - rim(true)).toBe(12);
  });
});
