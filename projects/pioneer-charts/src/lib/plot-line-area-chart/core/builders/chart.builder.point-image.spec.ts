import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType, PcacPointImageConfig } from '../../plot-line-area-chart.model';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';

/** Same technique as chart.builder.clip.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`. */
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

function config(points: PcacData[], pointImage?: Partial<PcacPointImageConfig>): PcacLineAreaChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    xAxis: { domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    colorOverride: [],
    ...(pointImage ? { pointImage } : {}),
    data: [{ key: '', value: null, hide: false, data: points }],
  };
}

function build(cfg: PcacLineAreaChartConfig, type = PcacLineAreaPlotChartConfigType.Line): { builder: PlaChartBuilder; svg: SVGSVGElement } {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm(800);
  builder.buildChart(elm, cfg, type);
  return { builder, svg: elm.nativeElement };
}

/** Same technique as chart.builder.zoom.spec.ts: drive the zoom callback directly with a real transform. */
function zoomTo(builder: PlaChartBuilder, transform: typeof zoomIdentity): void {
  const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
  const onZoom = zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void;
  onZoom({ transform });
}

/** Each `.point` group's `display` attribute - `null` when shown, `'none'` when hidden. */
function displays(svg: SVGSVGElement): (string | null)[] {
  return Array.from(svg.querySelectorAll('.dots .point')).map((p) => p.getAttribute('display'));
}

describe('PlaChartBuilder point images', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  it('draws an <image> instead of a dot for points that have one, and a dot for those that do not', () => {
    const { svg } = build(config([point(0, 10), point(1, 20, 'a.png'), point(2, 30)]));

    const points = Array.from(svg.querySelectorAll('.dots .point'));
    expect(points.length).toBe(3);
    expect(points[0].querySelector('circle.dot')).not.toBeNull();
    expect(points[0].querySelector('image')).toBeNull();
    expect(points[1].querySelector('circle.dot')).toBeNull();
    expect(points[1].querySelector('image.dot-image')?.getAttribute('href')).toBe('a.png');
    expect(points[2].querySelector('circle.dot')).not.toBeNull();
  });

  it('sizes the image to the configured maxWidth/maxHeight box, preserving aspect ratio, centered on the point', () => {
    const { svg } = build(config([point(0, 10, 'a.png')], { maxWidth: 40, maxHeight: 24 }));

    const image = svg.querySelector('image.dot-image')!;
    expect(image.getAttribute('width')).toBe('40');
    expect(image.getAttribute('height')).toBe('24');
    // "meet" = scale uniformly to fit inside the box; xMid/YMid = center within it.
    expect(image.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    // The box itself is centered on the data point (whose x lives on the parent's translate).
    expect(image.getAttribute('x')).toBe('-20');
  });

  it('falls back to PcacPointImageConfig defaults for any unset dimension', () => {
    const defaults = new PcacPointImageConfig();
    const { svg } = build(config([point(0, 10, 'a.png')], { maxHeight: 50 }));

    const image = svg.querySelector('image.dot-image')!;
    expect(image.getAttribute('width')).toBe(String(defaults.maxWidth));
    expect(image.getAttribute('height')).toBe('50');
  });

  it('positions each point by its index within its own series, via the point group transform', () => {
    // Two series: a flat svg.selectAll('.point') would number the second series' points 3, 4, 5.
    const cfg = config([point(0, 10), point(1, 20), point(2, 30)]);
    cfg.data.push({ key: '', value: null, hide: false, data: [point(0, 5, 'a.png'), point(1, 6), point(2, 7)] });
    const { builder, svg } = build(cfg);

    const groups = Array.from(svg.querySelectorAll('.dots'));
    expect(groups.length).toBe(2);
    const xOf = (g: Element) => Array.from(g.querySelectorAll('.point'))
      .map((p) => /translate\(([^,]+),/.exec(p.getAttribute('transform')!)![1]);
    expect(xOf(groups[1])).toEqual(xOf(groups[0]));
    expect(xOf(groups[0])).toEqual(['0', String(builder.width / 2), String(builder.width)]);
  });

  it('widens the clip-path buffer so an image at the domain edge is not cut off', () => {
    const { builder, svg } = build(config([point(0, 10, 'a.png')], { maxWidth: 60, maxHeight: 20 }));

    const clipRect = svg.querySelector('clipPath rect')!;
    expect(Number(clipRect.getAttribute('x'))).toBe(-30);
    expect(Number(clipRect.getAttribute('width'))).toBe(builder.width + 60);

    // Without any images, the regular 10px dot buffer is kept.
    const plain = build(config([point(0, 10)], { maxWidth: 60, maxHeight: 20 }));
    expect(Number(plain.svg.querySelector('clipPath rect')!.getAttribute('x'))).toBe(-10);
  });

  it('grows the margins to half the image box so an image at the domain edge is inside the SVG, not just the clip-path', () => {
    const { builder, svg } = build(config([point(0, 100, 'a.png')], { maxWidth: 60, maxHeight: 40 }));

    expect(builder.margin.top).toBe(20);
    expect(builder.margin.right).toBe(30);
    expect(builder.margin.bottom).toBe(20);
    // 40 by default already covers half of 60, so it's left as is rather than grown to 70.
    expect(builder.margin.left).toBe(40);

    // The image sits at y = 0 in the plot group, its top edge 20px above that - exactly at the
    // SVG's top edge once the group is translated down by margin.top.
    const image = svg.querySelector('image.dot-image')!;
    expect(Number(image.getAttribute('height'))).toBe(40);
    expect(svg.querySelector('g')!.getAttribute('transform')).toBe('translate(40,20)');
  });

  it('keeps the SVG height the consumer configured when images grow the vertical margins', () => {
    const plain = build(config([point(0, 100)], { maxWidth: 60, maxHeight: 40 }));
    const withImage = build(config([point(0, 100, 'a.png')], { maxWidth: 60, maxHeight: 40 }));

    expect(plain.builder.margin.top).toBe(8);
    expect(withImage.svg.getAttribute('height')).toBe(plain.svg.getAttribute('height'));
    expect(withImage.builder.height).toBe(plain.builder.height - 12);
  });

  it('does not grow the margins for a pointImage config when no point has an image', () => {
    const { builder } = build(config([point(0, 100)], { maxWidth: 60, maxHeight: 40 }));

    expect(builder.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
  });

  it('grows a hidden axis\'s 8px margins too, since an image there is just as easily cut off', () => {
    const cfg = config([point(0, 100, 'a.png')], { maxWidth: 30, maxHeight: 30 });
    cfg.yAxis = { ...cfg.yAxis, hide: true };
    const { builder } = build(cfg);

    expect(builder.margin.top).toBe(15);
    expect(builder.margin.left).toBe(15);
  });

  it('keeps the theme palette when colorOverride is the class default (an empty array)', () => {
    const cfg = config([point(0, 10)]);
    cfg.colorOverride = [];
    const { svg } = build(cfg);

    // The dot's stroke is set synchronously (the line's is set inside its enter transition,
    // which doesn't run in jsdom), so it's the observable here.
    expect(svg.querySelector('circle.dot')!.getAttribute('stroke')).toMatch(/^#/);
  });

  it('uses colorOverride entries, in series order, when given', () => {
    const cfg = config([point(0, 10)]);
    cfg.colorOverride = ['#123456'];
    const { svg } = build(cfg);

    expect(svg.querySelector('circle.dot')!.getAttribute('stroke')).toBe('#123456');
  });

  // The clip-path's half-box buffer exists so an image centered on an axis is drawn whole, but on
  // its own it also let an image whose center zoom had carried *past* the axis keep showing - up
  // to a whole half-image sitting entirely outside the plot, on any side. A point is now hidden
  // the moment its center leaves the plot area, so half a mark over the axis is the most that
  // ever shows.
  describe('at the edge of the plot under zoom', () => {
    // A decimal x axis so points sit where their keys say; images 40px, plot 0..100 on both axes.
    const zoomable = (points: PcacData[]) => ({
      ...config(points, { maxWidth: 40, maxHeight: 40 }),
      xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
      enableZoomX: true,
      enableZoomY: true,
    });

    it('shows every point, including ones on the domain edge, before any zoom', () => {
      const { svg } = build(zoomable([point(0, 0, 'a.png'), point(50, 50, 'b.png'), point(100, 100, 'c.png')]), PcacLineAreaPlotChartConfigType.Plot);

      expect(displays(svg)).toEqual([null, null, null]);
    });

    it('hides a point once its center is carried past the left or top edge, and shows it again on the way back', () => {
      const { svg, builder } = build(zoomable([point(0, 100, 'a.png'), point(50, 50, 'b.png')]), PcacLineAreaPlotChartConfigType.Plot);

      // Pan the plot 1px left and 1px up: the corner point's center is now just outside on both axes.
      zoomTo(builder, zoomIdentity.translate(-1, -1));
      expect(displays(svg)).toEqual(['none', null]);

      zoomTo(builder, zoomIdentity);
      expect(displays(svg)).toEqual([null, null]);
    });

    it('hides a point carried past the right or bottom edge', () => {
      const { svg, builder } = build(zoomable([point(100, 0, 'a.png'), point(50, 50, 'b.png')]), PcacLineAreaPlotChartConfigType.Plot);

      zoomTo(builder, zoomIdentity.translate(1, 0));
      expect(displays(svg)).toEqual(['none', null]);
      zoomTo(builder, zoomIdentity.translate(0, 1));
      expect(displays(svg)).toEqual(['none', null]);
      zoomTo(builder, zoomIdentity.translate(-1, -1));
      expect(displays(svg)).toEqual([null, null]);
    });

    it('keeps a point whose center is still inside, however little, even with most of its image outside', () => {
      const { svg, builder } = build(zoomable([point(0, 50, 'a.png')]), PcacLineAreaPlotChartConfigType.Plot);

      // Zooming in about the far right corner drags x = 0 left; a scale of 1 keeps it at 0. Panning
      // right instead keeps it inside, drawn whole with half over the axis, as the clip-path allows.
      zoomTo(builder, zoomIdentity.translate(0.25, 0));
      expect(displays(svg)).toEqual([null]);
    });

    it('clips lines and areas to the plot area rather than the points\' image-sized buffer', () => {
      const line = build(config([point(0, 10, 'a.png'), point(1, 20)], { maxWidth: 40, maxHeight: 40 }), PcacLineAreaPlotChartConfigType.Line);
      const area = build(config([point(0, 10, 'a.png'), point(1, 20)], { maxWidth: 40, maxHeight: 40 }), PcacLineAreaPlotChartConfigType.Area);

      for (const { svg, builder } of [line, area]) {
        const [buffered, plot] = Array.from(svg.querySelectorAll('clipPath'));
        expect(Number(buffered.querySelector('rect')!.getAttribute('x'))).toBe(-20);
        expect(Number(plot.querySelector('rect')!.getAttribute('x'))).toBe(-1);
        expect(Number(plot.querySelector('rect')!.getAttribute('width'))).toBe(builder.width + 2);
        const clipOf = (el: Element) => /#([\w-]+)/.exec(el.getAttribute('clip-path')!)![1];
        expect(clipOf(svg.querySelector('.lines, .areas')!)).toBe(plot.getAttribute('id'));
        expect(clipOf(svg.querySelector('.dots')!)).toBe(buffered.getAttribute('id'));
      }
    });

    it('applies to plain dots as well as images', () => {
      const { svg, builder } = build(zoomable([point(0, 50), point(50, 50)]), PcacLineAreaPlotChartConfigType.Plot);

      zoomTo(builder, zoomIdentity.translate(-1, 0));
      expect(displays(svg)).toEqual(['none', null]);
    });

    it('clips fan-out anchors and spokes to the plot area (plus a stroke), not the buffered clip-path', () => {
      const cfg = {
        ...zoomable([point(50, 0, 'a.png')]),
        pointFanOut: {},
        data: [
          { key: 'a', value: null, hide: false, data: [point(50, 0, 'a.png')] },
          { key: 'b', value: null, hide: false, data: [point(50, 0, 'b.png')] },
        ],
      };
      const { svg, builder } = build(cfg, PcacLineAreaPlotChartConfigType.Plot);

      const rects = Array.from(svg.querySelectorAll('clipPath rect'));
      expect(rects.length).toBe(2);
      const plotRect = rects[1];
      expect([plotRect.getAttribute('x'), plotRect.getAttribute('y')]).toEqual(['-1', '-1']);
      expect(Number(plotRect.getAttribute('width'))).toBe(builder.width + 2);
      expect(Number(plotRect.getAttribute('height'))).toBe(builder.height + 2);
      const clipOf = (el: Element) => /#([\w-]+)/.exec(el.getAttribute('clip-path')!)![1];
      expect(clipOf(svg.querySelector('.fan-outs')!)).toBe(plotRect.parentElement!.getAttribute('id'));
      expect(clipOf(svg.querySelector('.dots')!)).toBe(rects[0].parentElement!.getAttribute('id'));

      // Pan the pair on the baseline down by 30: the anchor and lower member (following it out at
      // the same pace) are past the axis and the lower member is hidden; the upper member, 44px
      // above the lower one, is still inside and shown.
      zoomTo(builder, zoomIdentity.translate(0, 30));
      expect(displays(svg)).toEqual([null, 'none']);
    });
  });
});
