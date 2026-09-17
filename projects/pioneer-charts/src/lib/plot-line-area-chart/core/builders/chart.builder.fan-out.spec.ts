import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig, PcacPointFanOutConfig } from '../../plot/plot.model';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';
import { PcacTooltipContext } from '../../../core/tooltip.directive';

/** Same technique as chart.builder.point-image.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function point(key: number, value: number, image?: string): PcacData {
  return { key, value, hide: false, data: [], ...(image ? { image } : {}) };
}

/** One point per series - the plot chart's usual shape - so every series index is a point index. */
function config(points: PcacData[], pointFanOut?: Partial<PcacPointFanOutConfig>): PcacPlotChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    colorOverride: [],
    pointImage: { maxWidth: 40, maxHeight: 40 },
    ...(pointFanOut ? { pointFanOut } : {}),
    data: points.map((p, i) => ({ key: `series ${i}`, value: null, hide: false, data: [p] })),
  };
}

function build(cfg: PcacPlotChartConfig, type = PcacLineAreaPlotChartConfigType.Plot): { builder: PlaChartBuilder; svg: SVGSVGElement } {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm(800);
  builder.buildChart(elm, cfg, type);
  return { builder, svg: elm.nativeElement };
}

/**
 * Image x positions. Only x is observable here: like the point-image spec, the final y is set
 * inside the enter transition, which jsdom never runs - so the specs below read a pair's vertical
 * spread off its spokes (set synchronously) and use four-point groups for the images.
 */
function imageXs(svg: SVGSVGElement): number[] {
  return Array.from(svg.querySelectorAll('image.dot-image')).map((image) => Number(image.getAttribute('x')));
}

function spokeDeltas(svg: SVGSVGElement): { dx: number; dy: number }[] {
  return Array.from(svg.querySelectorAll('line.fan-out-spoke')).map((s) => ({
    dx: Number(s.getAttribute('x2')) - Number(s.getAttribute('x1')),
    dy: Number(s.getAttribute('y2')) - Number(s.getAttribute('y1')),
  }));
}

const four = (image = true) => [1, 2, 3, 4].map((i) => point(50, 50, image ? `${i}.png` : undefined));

function hover(svg: SVGSVGElement, pointIndex: number): void {
  svg.querySelectorAll('.point')[pointIndex].dispatchEvent(new MouseEvent('mouseover'));
}

describe('PlaChartBuilder point fan-out', () => {
  let shown: PcacTooltipContext[];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    shown = [];
    vi.spyOn(PlaChartBuilder.prototype, 'showTooltip').mockImplementation(function (this: PlaChartBuilder, _event, data, options) {
      shown.push({ $implicit: data, parent: options.parent ?? null, isThreshold: false, index: options.index, parentIndex: options.parentIndex ?? null, coincident: options.coincident ?? [] });
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('draws coincident points on top of one another when pointFanOut is not set', () => {
    const { svg } = build(config(four()));

    expect(imageXs(svg)).toEqual([-20, -20, -20, -20]);
    expect(svg.querySelector('.fan-outs')).toBeNull();
  });

  it('spreads a pair straight up and down from the shared coordinate, size + gap apart', () => {
    const { svg } = build(config([point(50, 50, 'a.png'), point(50, 50, 'b.png')], {}));

    // Both point groups still carry the true x; the offset is on the image, inside the group.
    const transforms = Array.from(svg.querySelectorAll('.point')).map((p) => p.getAttribute('transform'));
    expect(transforms[0]).toBe(transforms[1]);
    expect(imageXs(svg)).toEqual([-20, -20]);
    // Image boxes 40px tall with the default 4px gap: centers 44px apart, 22 either side.
    expect(spokeDeltas(svg)).toEqual([{ dx: 0, dy: -22 }, { dx: 0, dy: 22 }]);
  });

  it('fans a larger group around a ring, first member at the top, sized so neighbours clear each other', () => {
    const { svg } = build(config(four(), {}));

    // Four 40px marks 4px apart: chord 44, radius 44 / (2 sin 45) = 31.11.
    const r = 44 / (2 * Math.sin(Math.PI / 4));
    const xs = imageXs(svg).map((x) => x + 20);
    expect(xs[0]).toBeCloseTo(0);
    expect(xs[1]).toBeCloseTo(r, 1);
    expect(xs[2]).toBeCloseTo(0);
    expect(xs[3]).toBeCloseTo(-r, 1);
    const deltas = spokeDeltas(svg);
    expect(deltas.map((d) => Math.hypot(d.dx, d.dy))).toEqual(deltas.map(() => expect.closeTo(r, 1)));
    expect(deltas[0].dy).toBeCloseTo(-r, 1);
  });

  it('uses a fixed radius for every group when one is configured', () => {
    const { svg } = build(config(four(), { radius: 30 }));

    expect(imageXs(svg).map((x) => x + 20)).toEqual([0, 30, 0, -30]);
  });

  it('leaves points that share nothing where they are', () => {
    const { svg } = build(config([point(50, 50, 'a.png'), point(60, 50, 'b.png')], {}));

    expect(imageXs(svg)).toEqual([-20, -20]);
    expect(svg.querySelector('.fan-outs')).toBeNull();
  });

  it('offsets plain dots the same way, via cx', () => {
    const { svg } = build(config(four(false), {}));

    const cx = Array.from(svg.querySelectorAll('circle.dot')).map((dot) => Number(dot.getAttribute('cx')));
    // A hovered dot is 12px across, plus the 4px gap: chord 16 on a ring of four, radius 11.31.
    expect(cx).toEqual([0, 11.31, 0, -11.31]);
  });

  it('draws an anchor dot on the coordinate with a spoke to each fanned-out point', () => {
    const { svg } = build(config([point(50, 50, 'a.png'), point(50, 50, 'b.png')], {}));

    const fanOut = svg.querySelector('.fan-outs .fan-out')!;
    expect(fanOut.getAttribute('transform')).toBe(svg.querySelector('.point')!.getAttribute('transform'));
    expect(fanOut.querySelectorAll('circle.fan-out-anchor').length).toBe(1);
    const spokes = Array.from(fanOut.querySelectorAll('line.fan-out-spoke'));
    expect(spokes.length).toBe(2);
    expect(spokes.map((s) => s.getAttribute('x1'))).toEqual(['0', '0']);
    expect(spokes.map((s) => Number(s.getAttribute('y2')) - Number(s.getAttribute('y1')))).toEqual([-22, 22]);
  });

  it('can leave the anchors out', () => {
    const { svg } = build(config(four(), { showAnchor: false }));

    expect(svg.querySelector('.fan-outs')).toBeNull();
    expect(imageXs(svg)[1]).toBeGreaterThan(0);
  });

  it('draws the spokes underneath the points', () => {
    const { svg } = build(config([point(50, 50, 'a.png'), point(50, 50, 'b.png')], {}));

    const children = Array.from(svg.querySelector('g')!.children).map((c) => c.getAttribute('class'));
    expect(children.indexOf('fan-outs')).toBeLessThan(children.indexOf('dots'));
  });

  it('reserves edge space for the fan-out\'s reach on top of the image box', () => {
    const plain = build(config([point(50, 50, 'a.png'), point(50, 50, 'b.png')]));
    const fanned = build(config([point(50, 50, 'a.png'), point(50, 50, 'b.png')], {}));

    // Half the 40px box (20), plus the pair's 22px radius.
    expect(plain.builder.margin.top).toBe(20);
    expect(fanned.builder.margin.top).toBe(42);
    expect(Number(fanned.svg.querySelector('clipPath rect')!.getAttribute('x'))).toBe(-42);
  });

  it('reserves nothing extra when pointFanOut is on but no points coincide', () => {
    const { builder } = build(config([point(50, 50, 'a.png'), point(60, 50, 'b.png')], {}));

    expect(builder.margin.top).toBe(20);
  });

  it('is ignored on line and area charts, whose points are joined in order', () => {
    const { svg, builder } = build(config(four(), {}), PcacLineAreaPlotChartConfigType.Line);

    expect(imageXs(svg)).toEqual([-20, -20, -20, -20]);
    expect(svg.querySelector('.fan-outs')).toBeNull();
    expect(builder.margin.top).toBe(20);
  });

  it('lists the other points at the hovered coordinate in the tooltip context, located by series', () => {
    const cfg = config([point(50, 50, 'a.png'), point(60, 60, 'x.png'), point(50, 50, 'b.png'), point(50, 50, 'c.png')], {});
    const { svg } = build(cfg);

    hover(svg, 2);
    expect(shown.length).toBe(1);
    // The builder works on a deep copy of the config, so compare by value.
    expect(shown[0].$implicit).toEqual(cfg.data[2].data[0]);
    expect(shown[0].parentIndex).toBe(2);
    expect(shown[0].coincident.map((c) => c.parentIndex)).toEqual([0, 3]);
    expect(shown[0].coincident.map((c) => c.index)).toEqual([0, 0]);
    expect(shown[0].coincident[0].data).toEqual(cfg.data[0].data[0]);
    expect(shown[0].coincident[0].parent).toEqual(cfg.data[0]);

    hover(svg, 1);
    expect(shown[1].coincident).toEqual([]);
  });

  it('still lists coincident points in the tooltip when the fan-out is off', () => {
    const cfg = config([point(50, 50, 'a.png'), point(50, 50, 'b.png')]);
    const { svg } = build(cfg);

    hover(svg, 0);
    expect(shown[0].coincident.map((c) => c.parentIndex)).toEqual([1]);
  });
});
