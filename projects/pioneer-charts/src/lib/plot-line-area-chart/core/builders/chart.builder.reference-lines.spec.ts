import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig } from '../../plot/plot.model';
import { PcacFormatEnum } from '../../../core/chart.model';

/** Same technique as chart.builder.point-image.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function config(extra: Partial<PcacPlotChartConfig> = {}): PcacPlotChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    colorOverride: [],
    data: [{ key: 'series', value: null, hide: false, data: [{ key: 50, value: 50, hide: false, data: [] }] }],
    ...extra,
  };
}

function build(cfg: PcacPlotChartConfig): { builder: PlaChartBuilder; svg: SVGSVGElement } {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm(800);
  builder.buildChart(elm, cfg, PcacLineAreaPlotChartConfigType.Plot);
  return { builder, svg: elm.nativeElement };
}

/** Same technique as chart.builder.zoom.spec.ts: drive the zoom callback directly with a real transform. */
function zoomTo(builder: PlaChartBuilder, transform: typeof zoomIdentity): void {
  const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
  const onZoom = zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void;
  onZoom({ transform });
}

/** The plot area's size, as the builder worked it out. */
function plotSize(builder: PlaChartBuilder): { width: number; height: number } {
  const { width, height } = builder as unknown as { width: number; height: number };
  return { width, height };
}

function strokes(svg: SVGSVGElement): { x1: number; x2: number; y1: number; y2: number }[] {
  return Array.from(svg.querySelectorAll('line.reference-line-stroke')).map((line) => ({
    x1: Number(line.getAttribute('x1')),
    x2: Number(line.getAttribute('x2')),
    y1: Number(line.getAttribute('y1')),
    y2: Number(line.getAttribute('y2')),
  }));
}

describe('PlaChartBuilder reference lines and corner labels', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('draws nothing extra when neither is set', () => {
    const { svg } = build(config());
    expect(svg.querySelector('.reference-lines')).toBeNull();
    expect(svg.querySelector('.corner-labels')).toBeNull();
  });

  it('draws a horizontal line at a y value and a vertical one at an x value, across the plot', () => {
    const { builder, svg } = build(config({
      referenceLines: [{ axis: 'y', value: 25 }, { axis: 'x', value: 50 }],
    }));
    const { width, height } = plotSize(builder);
    const [horizontal, vertical] = strokes(svg);

    // y domain 0..100 runs bottom to top, so 25 sits three quarters of the way down.
    expect(horizontal).toEqual({ x1: 0, x2: width, y1: height * 0.75, y2: height * 0.75 });
    expect(vertical).toEqual({ x1: width / 2, x2: width / 2, y1: 0, y2: height });
  });

  it('defaults a line to the y axis', () => {
    const { builder, svg } = build(config({ referenceLines: [{ value: 50 }] }));
    const { height } = plotSize(builder);
    expect(strokes(svg)[0].y1).toBe(height / 2);
    expect(svg.querySelector('.reference-line')!.classList).toContain('reference-line-y');
  });

  it('reads an x value as a date on a DateTime axis', () => {
    const { builder, svg } = build(config({
      xAxis: { format: PcacFormatEnum.DateTime, domainMin: '2026-01-01', domainMax: '2026-01-03' },
      data: [{ key: 'series', value: null, hide: false, data: [{ key: '2026-01-02', value: 50, hide: false, data: [] }] }],
      referenceLines: [{ axis: 'x', value: '2026-01-02' }],
    }));
    expect(strokes(svg)[0].x1).toBe(plotSize(builder).width / 2);
  });

  it('labels a line at its far end, and hides a line whose value does not place, label and all', () => {
    const { svg } = build(config({
      referenceLines: [{ axis: 'y', value: 50, label: 'Median' }, { axis: 'x', value: 'not a number', label: 'Nowhere' }],
    }));
    const lines = svg.querySelectorAll('.reference-line');
    const [placed, unplaced] = Array.from(svg.querySelectorAll('.reference-line-label'));
    expect(placed.textContent).toBe('Median');
    expect(placed.getAttribute('text-anchor')).toBe('end');
    expect(lines[1].getAttribute('display')).toBe('none');
    expect(unplaced.getAttribute('display')).toBe('none');
  });

  it('keeps the labels in a group of their own, clipped and colored like their lines', () => {
    const { svg } = build(config({
      referenceLines: [{ value: 50, label: 'Target', color: 'tomato' }, { value: 60 }],
    }));
    const group = svg.querySelector<SVGGElement>('.reference-line-labels')!;
    expect(group.getAttribute('clip-path')).toMatch(/^url\(#pcac-clip-plot-\d+\)$/);
    expect(group.getAttribute('aria-hidden')).toBe('true');
    // Only the labelled line has one.
    const labels = Array.from(group.querySelectorAll<SVGTextElement>('.reference-line-label'));
    expect(labels.map((label) => label.textContent)).toEqual(['Target']);
    expect(labels[0].style.getPropertyValue('--pcac-reference-line-color')).toBe('tomato');
    expect(svg.querySelector('.reference-line .reference-line-label')).toBeNull();
  });

  it("puts a label at the line's start when asked: beside a vertical line's bottom, above a horizontal one's left end", () => {
    const { builder, svg } = build(config({
      referenceLines: [
        { axis: 'x', value: 50, label: 'Bottom', labelPosition: 'start' },
        { axis: 'y', value: 50, label: 'Left', labelPosition: 'start' },
        { axis: 'x', value: 50, label: 'Top' },
      ],
    }));
    const { width, height } = plotSize(builder);
    const place = (label: Element) => ['x', 'y', 'text-anchor', 'dominant-baseline'].map((name) => label.getAttribute(name));
    const [bottom, left, top] = Array.from(svg.querySelectorAll('.reference-line-label'));
    expect(place(bottom)).toEqual([`${width / 2 + 4}`, `${height - 4}`, 'start', 'auto']);
    expect(place(left)).toEqual(['4', `${height / 2 - 4}`, 'start', 'auto']);
    expect(place(top)).toEqual([`${width / 2 + 4}`, '4', 'start', 'hanging']);
  });

  it('clips the lines to the plot, colors each from its config, and hides them from screen readers', () => {
    const { svg } = build(config({ referenceLines: [{ value: 50, color: 'tomato' }, { value: 60 }] }));
    const group = svg.querySelector<SVGGElement>('.reference-lines')!;
    expect(group.getAttribute('clip-path')).toMatch(/^url\(#pcac-clip-plot-\d+\)$/);
    expect(group.getAttribute('aria-hidden')).toBe('true');
    const [colored, plain] = Array.from(svg.querySelectorAll<SVGGElement>('.reference-line'));
    expect(colored.style.getPropertyValue('--pcac-reference-line-color')).toBe('tomato');
    expect(plain.style.getPropertyValue('--pcac-reference-line-color')).toBe('');
  });

  it('moves the lines with zoom and leaves the corner labels where they are', () => {
    const { builder, svg } = build(config({
      enableZoomX: true,
      referenceLines: [{ axis: 'x', value: 50 }],
      cornerLabels: { topLeft: 'Early' },
    }));
    const { width } = plotSize(builder);
    const label = svg.querySelector('.corner-label')!;
    const before = label.getAttribute('x');

    // 2x zoom on x, panned so the domain's left edge stays put: 50 is now at the right edge.
    zoomTo(builder, zoomIdentity.scale(2));

    expect(strokes(svg)[0].x1).toBe(width);
    expect(label.getAttribute('x')).toBe(before);
  });

  describe('with a split', () => {
    const quadrants = { topLeft: 'TL', topRight: 'TR', bottomLeft: 'BL', bottomRight: 'BR' };
    const shown = (svg: SVGSVGElement) => Array.from(svg.querySelectorAll('.corner-label'))
      .filter((label) => label.getAttribute('display') !== 'none')
      .map((label) => label.textContent);

    it('shows every corner while each quadrant is in its corner', () => {
      const { svg } = build(config({ cornerLabels: { ...quadrants, split: { x: 50, y: 50 } } }));
      expect(shown(svg)).toEqual(['TL', 'TR', 'BL', 'BR']);
    });

    it('leaves only the quadrant zoomed into', () => {
      const { builder, svg } = build(config({
        enableZoomX: true,
        enableZoomY: true,
        cornerLabels: { ...quadrants, split: { x: 50, y: 50 } },
      }));
      // 2x from the top-left corner: x 0 - 50 and y 50 - 100 in view, the top-left quadrant exactly
      zoomTo(builder, zoomIdentity.scale(2));
      expect(shown(svg)).toEqual(['TL']);

      zoomTo(builder, zoomIdentity);
      expect(shown(svg)).toEqual(['TL', 'TR', 'BL', 'BR']);
    });

    it('splits only the axes it is given', () => {
      const { builder, svg } = build(config({ enableZoomX: true, cornerLabels: { ...quadrants, split: { x: 50 } } }));
      zoomTo(builder, zoomIdentity.scale(2));
      expect(shown(svg)).toEqual(['TL', 'BL']);
    });

    it('hides a label its quadrant has no room for', () => {
      // 40 x 12 a label: the left quadrants, 2% of the plot wide, can't hold one with its insets
      const proto = SVGElement.prototype as unknown as { getBBox?: () => DOMRect };
      proto.getBBox = () => ({ x: 0, y: 0, width: 40, height: 12 }) as DOMRect;
      try {
        const { svg } = build(config({ cornerLabels: { ...quadrants, split: { x: 2, y: 50 } } }));
        expect(shown(svg)).toEqual(['TR', 'BR']);
      } finally {
        delete proto.getBBox;
      }
    });
  });

  it('draws only the corners it is given, inset from each, under the series', () => {
    const { builder, svg } = build(config({
      cornerLabels: { topLeft: 'Early, strong', bottomRight: 'Late, controlled', color: 'teal' },
    }));
    const { width, height } = plotSize(builder);
    const labels = Array.from(svg.querySelectorAll('.corner-label'));
    expect(labels.map((label) => label.textContent)).toEqual(['Early, strong', 'Late, controlled']);
    expect(labels[0].classList).toContain('corner-label-top-left');
    expect([labels[0].getAttribute('x'), labels[0].getAttribute('y')]).toEqual(['8', '8']);
    expect([labels[1].getAttribute('x'), labels[1].getAttribute('y')]).toEqual([`${width - 8}`, `${height - 8}`]);
    expect(labels[1].getAttribute('text-anchor')).toBe('end');

    const group = svg.querySelector<SVGGElement>('.corner-labels')!;
    expect(group.style.getPropertyValue('--pcac-corner-label-color')).toBe('teal');
    expect(group.getAttribute('aria-hidden')).toBe('true');
    // Earlier in the document than the points, so a point in the corner covers its label.
    const dots = svg.querySelector('.dots')!;
    expect(group.compareDocumentPosition(dots) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  describe('labelsOnTop', () => {
    /** Whether `a` comes after `b` in the document, and so is painted over it. */
    const paintedOver = (a: Element, b: Element) => !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);

    it('leaves the labels under the series, without a halo, by default', () => {
      const { svg } = build(config({ referenceLines: [{ value: 50, label: 'Median' }], cornerLabels: { topLeft: 'Early' } }));
      const dots = svg.querySelector('.dots')!;
      for (const group of Array.from(svg.querySelectorAll('.corner-labels, .reference-line-labels'))) {
        expect(paintedOver(group, dots)).toBe(false);
        expect(group.classList).not.toContain('pcac-labels-on-top');
      }
    });

    it('raises the labels over the series and marks them for the halo, leaving the lines under it', () => {
      const { svg } = build(config({
        labelsOnTop: true,
        referenceLines: [{ value: 50, label: 'Median' }],
        cornerLabels: { topLeft: 'Early' },
      }));
      const dots = svg.querySelector('.dots')!;
      for (const group of Array.from(svg.querySelectorAll('.corner-labels, .reference-line-labels'))) {
        expect(paintedOver(group, dots)).toBe(true);
        expect(group.classList).toContain('pcac-labels-on-top');
      }
      expect(paintedOver(svg.querySelector('.reference-lines')!, dots)).toBe(false);
    });

    it('keeps them over the series through a zoom, which re-raises the series', () => {
      const { builder, svg } = build(config({
        labelsOnTop: true,
        enableZoomX: true,
        referenceLines: [{ axis: 'x', value: 50, label: 'Median' }],
        cornerLabels: { topLeft: 'Early' },
      }));
      zoomTo(builder, zoomIdentity.scale(2));
      const dots = svg.querySelector('.dots')!;
      expect(paintedOver(svg.querySelector('.corner-labels')!, dots)).toBe(true);
      expect(paintedOver(svg.querySelector('.reference-line-labels')!, dots)).toBe(true);
    });
  });
});
