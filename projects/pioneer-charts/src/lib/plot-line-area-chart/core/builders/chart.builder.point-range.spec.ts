import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PlaChartScales } from './scales.builder';
import { rangeExtent, rangeFocus } from './point-range.builder';
import {
  PcacLineAreaPlotChartConfigType, PcacPointRangeConfig, PcacPointRangeShow, PcacPointRangeStyle
} from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig } from '../../plot/plot.model';
import { PcacData, PcacDataRange, PcacFormatEnum } from '../../../core/chart.model';

/** Same technique as chart.builder.point-image.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function point(key: number | string, value: number, range?: PcacDataRange): PcacData {
  return { key, value, hide: false, data: [], ...(range ? { range } : {}) };
}

function config(
  series: PcacData[][], pointRange?: Partial<PcacPointRangeConfig>, format = PcacFormatEnum.Decimal,
  domain: [number | string, number | string] = [0, 100]
): PcacPlotChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: true,
    enableZoomY: true,
    xAxis: { format, domainMin: domain[0], domainMax: domain[1] },
    yAxis: { domainMin: 0, domainMax: 100 },
    colorOverride: ['#111111', '#222222'],
    ...(pointRange ? { pointRange } : {}),
    data: series.map((points, i) => ({ key: `series ${i}`, value: null, hide: false, data: points })),
  };
}

function build(cfg: PcacPlotChartConfig, type = PcacLineAreaPlotChartConfigType.Plot): { builder: PlaChartBuilder; svg: SVGSVGElement; scales: PlaChartScales } {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm(800);
  builder.buildChart(elm, cfg, type);
  const scales = (builder as unknown as { scales: PlaChartScales }).scales;
  return { builder, svg: elm.nativeElement, scales };
}

/** Same technique as chart.builder.zoom.spec.ts. */
function zoomTo(builder: PlaChartBuilder, transform: typeof zoomIdentity): void {
  const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
  const onZoom = zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void;
  onZoom({ transform });
}

/** The chart's layers, in paint order: the children of the group the ranges are drawn into. */
const layerOrder = (svg: SVGSVGElement) => Array.from(svg.querySelector('.point-ranges')!.parentElement!.children);
const num = (el: Element | null, attr: string) => Number(el!.getAttribute(attr));
const both: PcacDataRange = { x: { min: 40, max: 70 }, y: { min: 30, max: 80 } };

describe('PlaChartBuilder point ranges', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    // Hover shows the shared tooltip; its content isn't what's under test here.
    vi.spyOn(PlaChartBuilder.prototype, 'showTooltip').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('draws nothing when pointRange is not set, even for points with a range', () => {
    const { svg } = build(config([[point(50, 50, both)]]));
    expect(svg.querySelector('.point-ranges')).toBeNull();
  });

  it('draws a group only for the points that have a range, between the lines and the dots', () => {
    const { svg } = build(config([[point(20, 20), point(50, 50, both), point(80, 80)]], {}), PcacLineAreaPlotChartConfigType.Line);

    expect(svg.querySelectorAll('.point-range').length).toBe(1);
    const at = (selector: string) => layerOrder(svg).indexOf(svg.querySelector(selector)!);
    expect(at('.lines')).toBeLessThan(at('.point-ranges'));
    expect(at('.point-ranges')).toBeLessThan(at('.dots'));
    expect(svg.querySelector('.point-ranges')!.getAttribute('pointer-events')).toBe('none');
  });

  it('defaults to whiskers shown faint, with the series color on each series group', () => {
    const { svg, scales } = build(config([[point(50, 50, both)]], {}));
    const layer = svg.querySelector('.point-ranges')!;

    expect(layer.classList).toContain('pcac-range-faint');
    expect((layer as SVGGElement).style.getPropertyValue('--pcac-point-range-faint-opacity')).toBe('0.2');
    expect((svg.querySelector('.point-range-series') as SVGGElement).style.getPropertyValue('--pcac-point-range-series-color')).toBe('#111111');

    const [yBar, , , xBar] = Array.from(svg.querySelectorAll('.point-range line'));
    expect(svg.querySelectorAll('.point-range-whisker').length).toBe(2);
    expect(svg.querySelectorAll('.point-range-cap').length).toBe(4);
    // The y whisker runs down the point's x, from max to min; the x whisker along its y.
    expect(num(yBar, 'x1')).toBeCloseTo(scales.x(50));
    expect(num(yBar, 'y1')).toBeCloseTo(scales.y(80));
    expect(num(yBar, 'y2')).toBeCloseTo(scales.y(30));
    expect(num(xBar, 'x1')).toBeCloseTo(scales.x(40));
    expect(num(xBar, 'x2')).toBeCloseTo(scales.x(70));
    expect(num(xBar, 'y1')).toBeCloseTo(scales.y(50));
  });

  it('gives a series past the end of colorOverride a repeated color rather than none', () => {
    const { svg } = build(config([[point(20, 20, both)], [point(50, 50, both)], [point(80, 80, both)]], {}));

    const colors = Array.from(svg.querySelectorAll('.point-range-series'))
      .map((group) => (group as SVGGElement).style.getPropertyValue('--pcac-point-range-series-color'));
    expect(colors).toEqual(['#111111', '#222222', '#111111']);
  });

  it('draws only the whisker for the axis that has a range', () => {
    const { svg } = build(config([[point(30, 50, { y: { min: 40, max: 60 } }), point(70, 50, { x: { min: 60, max: 80 } })]], {}));
    const [yOnly, xOnly] = Array.from(svg.querySelectorAll('.point-range'));

    const yLine = yOnly.querySelector('.point-range-whisker')!;
    expect(yOnly.querySelectorAll('.point-range-whisker').length).toBe(1);
    expect(num(yLine, 'x1')).toBe(num(yLine, 'x2'));
    const xLine = xOnly.querySelector('.point-range-whisker')!;
    expect(xOnly.querySelectorAll('.point-range-whisker').length).toBe(1);
    expect(num(xLine, 'y1')).toBe(num(xLine, 'y2'));
  });

  it('reads a min above its max the other way round', () => {
    const { svg, scales } = build(config([[point(50, 50, { y: { min: 80, max: 30 } })]], {}));
    const line = svg.querySelector('.point-range-whisker')!;
    expect(num(line, 'y1')).toBeCloseTo(scales.y(80));
    expect(num(line, 'y2')).toBeCloseTo(scales.y(30));
  });

  it('draws a box spanning both ranges, and a thin strip with only one', () => {
    const { svg, scales } = build(config([[point(50, 50, both), point(20, 50, { y: { min: 40, max: 60 } })]], { style: PcacPointRangeStyle.Box }));
    const [box, strip] = Array.from(svg.querySelectorAll('.point-range-box'));

    expect(num(box, 'x')).toBeCloseTo(scales.x(40));
    expect(num(box, 'width')).toBeCloseTo(scales.x(70) - scales.x(40));
    expect(num(box, 'y')).toBeCloseTo(scales.y(80));
    expect(num(box, 'height')).toBeCloseTo(scales.y(30) - scales.y(80));
    expect(num(strip, 'width')).toBe(4);
  });

  it('fades from the value with a radial gradient focused on it when both ranges are set', () => {
    // 45 in 40..70 and 70 in 30..80: left of center and above it.
    const { svg } = build(config([[point(45, 70, both)]], { style: PcacPointRangeStyle.Fade }));
    const ellipse = svg.querySelector('ellipse.point-range-fade')!;
    const gradient = svg.querySelector('.point-range radialGradient')!;

    expect(ellipse.getAttribute('fill')).toBe(`url(#${gradient.id})`);
    expect(num(gradient, 'fx')).toBeCloseTo(5 / 30);
    expect(num(gradient, 'fy')).toBeCloseTo(10 / 50);
    // Every fade on the page has its own gradient.
    expect(document.querySelectorAll(`[id="${gradient.id}"]`).length).toBe(1);
  });

  it('fades along a bar with a linear gradient when only one range is set', () => {
    const { svg } = build(config([[point(50, 40, { y: { min: 30, max: 80 } })]], { style: PcacPointRangeStyle.Fade }));
    const stops = Array.from(svg.querySelectorAll('.point-range linearGradient stop'));

    expect(svg.querySelector('rect.point-range-fade')).not.toBeNull();
    // The brightest stop sits at the value: 40 is 40 of the 50 down from the top (80).
    expect(num(stops[1], 'offset')).toBeCloseTo(40 / 50);
  });

  it('places an x range the way the key is read under DateTime and the index formats', () => {
    const dated = build(config(
      [[point('2026-01-10', 50, { x: { min: '2026-01-05', max: '2026-01-15' } })]], {},
      PcacFormatEnum.DateTime, ['2026-01-01', '2026-01-31']
    ));
    const dLine = dated.svg.querySelector('.point-range-whisker')!;
    expect(num(dLine, 'x1')).toBeCloseTo(dated.scales.x(new Date('2026-01-05')));
    expect(num(dLine, 'x2')).toBeCloseTo(dated.scales.x(new Date('2026-01-15')));

    const indexed = build(config(
      [[point('a', 10), point('b', 20, { x: { min: 0.5, max: 1.5 } }), point('c', 30)]], {}, PcacFormatEnum.None
    ));
    const iLine = indexed.svg.querySelector('.point-range-whisker')!;
    expect(num(iLine, 'x1')).toBeCloseTo(indexed.scales.x(0.5));
    expect(num(iLine, 'x2')).toBeCloseTo(indexed.scales.x(1.5));
  });

  it('hides a hidden series\' ranges', () => {
    const cfg = config([[point(50, 50, both)]], {});
    cfg.data[0].hide = true;
    const { svg } = build(cfg);
    expect((svg.querySelector('.point-range-series') as SVGGElement).style.display).toBe('none');
  });

  it('puts the show mode and the color override on the chart\'s range group', () => {
    const { svg } = build(config([[point(50, 50, both)]], { show: PcacPointRangeShow.Always, color: 'tomato' }));
    const layer = svg.querySelector('.point-ranges') as SVGGElement;
    expect(layer.classList).toContain('pcac-range-always');
    expect(layer.style.getPropertyValue('--pcac-point-range-color')).toBe('tomato');
  });

  it('focuses the hovered point\'s range and lets go on mouseout', () => {
    const { svg } = build(config([[point(20, 50, both), point(50, 50, both)]], {}));
    const layer = svg.querySelector('.point-ranges')!;
    const [first, second] = Array.from(svg.querySelectorAll('.point-range'));
    const dot = svg.querySelectorAll('.point')[1];

    dot.dispatchEvent(new MouseEvent('mouseover'));
    expect(second.classList).toContain('is-focused');
    expect(first.classList).not.toContain('is-focused');
    expect(layer.classList).toContain('has-focus');

    dot.dispatchEvent(new MouseEvent('mouseout'));
    expect(second.classList).not.toContain('is-focused');
    expect(layer.classList).not.toContain('has-focus');
  });

  it('hovering a point without a range focuses nothing', () => {
    const { svg } = build(config([[point(20, 50), point(50, 50, both)]], {}));
    svg.querySelectorAll('.point')[0].dispatchEvent(new MouseEvent('mouseover'));
    expect(svg.querySelector('.point-range.is-focused')).toBeNull();
    expect(svg.querySelector('.point-ranges')!.classList).not.toContain('has-focus');
  });

  it('follows zoom, and stays under the dots after the axes are redrawn', () => {
    const { builder, svg, scales } = build(config([[point(50, 50, both)]], {}));
    const transform = zoomIdentity.translate(-200, -50).scale(2);

    zoomTo(builder, transform);

    const [yBar, , , xBar] = Array.from(svg.querySelectorAll('.point-range line'));
    const zx = transform.rescaleX(scales.x);
    const zy = transform.rescaleY(scales.y);
    expect(num(yBar, 'y1')).toBeCloseTo(zy(80));
    expect(num(xBar, 'x1')).toBeCloseTo(zx(40));
    const order = layerOrder(svg);
    expect(order.indexOf(svg.querySelector('.point-ranges')!)).toBeLessThan(order.indexOf(svg.querySelector('.dots')!));
  });

  it('keeps a fanned-out point\'s range on the shared coordinate', () => {
    const { svg, scales } = build({
      ...config([[point(50, 50, { y: { min: 40, max: 60 } })], [point(50, 50)]], {}),
      pointFanOut: {},
    });
    const line = svg.querySelector('.point-range-whisker')!;
    expect(num(line, 'x1')).toBeCloseTo(scales.x(50));
  });
});

describe('point range helpers', () => {
  const scales = { x: ((v: number) => v * 2) as unknown as PlaChartScales['x'], y: ((v: number) => 100 - v) as unknown as PlaChartScales['y'] };

  it('drops a range whose bounds do not parse', () => {
    expect(rangeExtent(point(1, 1, { x: { min: 'nope', max: 3 } }), 0, 0, PcacFormatEnum.Decimal, scales)).toBeNull();
    expect(rangeExtent(point(1, 1, { x: { min: 'nope', max: 3 }, y: { min: 1, max: 2 } }), 0, 0, PcacFormatEnum.Decimal, scales))
      .toEqual({ cx: 0, cy: 0, y0: 98, y1: 99 });
  });

  it('treats a range whose min equals its max as no range on that axis', () => {
    expect(rangeExtent(point(1, 1, { y: { min: 5, max: 5 } }), 0, 0, PcacFormatEnum.Decimal, scales)).toBeNull();
    expect(rangeExtent(point(1, 1, { x: { min: 2, max: 2 }, y: { min: 1, max: 2 } }), 0, 0, PcacFormatEnum.Decimal, scales))
      .toEqual({ cx: 0, cy: 0, y0: 98, y1: 99 });
  });

  it('centers the fade\'s focus on an axis without a range', () => {
    expect(rangeFocus({ cx: 5, cy: 5, y0: 0, y1: 10 })).toEqual({ fx: 0.5, fy: 0.5 });
  });
});
