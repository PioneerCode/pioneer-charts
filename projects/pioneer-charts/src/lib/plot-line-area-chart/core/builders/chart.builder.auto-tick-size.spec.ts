import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacAxisConfig, PcacData, PcacFormatEnum } from '../../../core/chart.model';

/** Same technique as chart.builder.point-image.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function point(key: number, value: number | null, extra: Partial<PcacData> = {}): PcacData {
  return { key, value, hide: false, data: [], ...extra };
}

const auto: PcacAxisConfig = { autoTickSize: true };

function config(points: PcacData[], extra: Partial<PcacLineAreaChartConfig> = {}): PcacLineAreaChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    data: [{ key: 'series', value: null, hide: false, data: points }],
    ...extra,
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100, ...extra.xAxis },
    yAxis: { domainMin: 0, domainMax: 100, ...extra.yAxis },
  };
}

function build(cfg: PcacLineAreaChartConfig, type = PcacLineAreaPlotChartConfigType.Plot): { builder: PlaChartBuilder; svg: SVGSVGElement } {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm(800);
  builder.buildChart(elm, cfg, type);
  return { builder, svg: elm.nativeElement };
}

const tickSizes = (builder: PlaChartBuilder) => ({ x: builder.xAxis.tickSize, y: builder.yAxis.tickSize });

/** The length of the first tick mark d3-axis drew on an axis. */
function drawnTick(svg: SVGSVGElement, axis: 'x' | 'y'): number {
  const line = svg.querySelector(`.pcac-${axis}-axis .tick line`)!;
  return Math.abs(Number(line.getAttribute(axis === 'x' ? 'y2' : 'x2')));
}

describe('PlaChartBuilder autoTickSize', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('leaves tickSize alone while autoTickSize is off', () => {
    const { builder } = build(config([point(50, 50)], { xAxis: { tickSize: 20 } }));
    expect(tickSizes(builder)).toEqual({ x: 20, y: undefined });
  });

  it('sizes the ticks to half a hovered dot, overriding any tickSize given', () => {
    const { builder, svg } = build(config([point(50, 50)], { xAxis: { ...auto, tickSize: 20 }, yAxis: { ...auto, tickSize: 2 } }));
    expect(tickSizes(builder)).toEqual({ x: 6, y: 6 });
    expect(drawnTick(svg, 'x')).toBe(6);
    expect(drawnTick(svg, 'y')).toBe(6);
    // Turned on, like a tickSize: the theme only shows marks on a `.pcac-axis-tick-marks` axis.
    expect(svg.querySelector('.pcac-x-axis')!.classList).toContain('pcac-axis-tick-marks');
  });

  it('applies to each axis on its own', () => {
    const { builder } = build(config([point(50, 50)], { xAxis: auto }));
    expect(tickSizes(builder)).toEqual({ x: 6, y: undefined });
  });

  it('uses an image box\'s height for the x axis and its width for the y axis, rounded up', () => {
    const { builder } = build(config([point(20, 50), point(50, 50, { image: 'ball.png' })], {
      xAxis: auto, yAxis: auto, pointImage: { maxWidth: 41, maxHeight: 20 },
    }));
    expect(tickSizes(builder)).toEqual({ x: 10, y: 21 });
  });

  it('keeps a dot\'s size when every image is smaller', () => {
    const { builder } = build(config([point(20, 50), point(50, 50, { image: 'ball.png' })], {
      xAxis: auto, yAxis: auto, pointImage: { maxWidth: 8, maxHeight: 8 },
    }));
    expect(tickSizes(builder)).toEqual({ x: 6, y: 6 });
  });

  it('takes in a gauge ring around a dot or an image, which is circular', () => {
    const dot = build(config([point(50, 50, { gauge: 0.5 })], {
      xAxis: auto, yAxis: auto, pointGauge: { gap: 3, width: 2 },
    }));
    // Hovered dot 6 + gap 3 + width 2.
    expect(tickSizes(dot.builder)).toEqual({ x: 11, y: 11 });

    const image = build(config([point(50, 50, { gauge: 0.5, image: 'ball.png' })], {
      xAxis: auto, yAxis: auto, pointGauge: { gap: 3, width: 2 }, pointImage: { maxWidth: 40, maxHeight: 20 },
    }));
    // The ring surrounds the box's larger side: 20 + 3 + 2, both ways.
    expect(tickSizes(image.builder)).toEqual({ x: 25, y: 25 });
  });

  it('ignores a gauge while pointGauge is off', () => {
    const { builder } = build(config([point(50, 50, { gauge: 0.5 })], { xAxis: auto }));
    expect(builder.xAxis.tickSize).toBe(6);
  });

  it('measures the largest mark, skipping gaps that draw nothing', () => {
    const { builder } = build(config([point(20, 50), point(50, null, { image: 'big.png' })], {
      xAxis: auto, pointImage: { maxWidth: 60, maxHeight: 60 },
    }));
    expect(builder.xAxis.tickSize).toBe(6);
  });

  it('counts a hidden series, so toggling it in a legend does not move the axes', () => {
    const cfg = config([point(50, 50)], { xAxis: auto, pointImage: { maxWidth: 30, maxHeight: 30 } });
    cfg.data.push({ key: 'hidden', value: null, hide: true, data: [point(20, 20, { image: 'ball.png' })] });
    expect(build(cfg).builder.xAxis.tickSize).toBe(15);
  });

  it('makes room in the margins for the auto length as for a tickSize, keeping the SVG height', () => {
    const plain = build(config([point(50, 50, { image: 'ball.png' })], { pointImage: { maxWidth: 30, maxHeight: 30 } }));
    const autoX = build(config([point(50, 50, { image: 'ball.png' })], { xAxis: auto, pointImage: { maxWidth: 30, maxHeight: 30 } }));
    // D3's default 6 -> 15: the bottom margin grows by 9, and the plot gives that up.
    expect(autoX.builder.margin.bottom - plain.builder.margin.bottom).toBe(9);
    expect(plain.builder.height - autoX.builder.height).toBe(9);
  });

  it('does the same on the line and area charts', () => {
    for (const type of [PcacLineAreaPlotChartConfigType.Line, PcacLineAreaPlotChartConfigType.Area]) {
      const { builder } = build(config([point(20, 50), point(50, 50, { image: 'ball.png' })], {
        xAxis: auto, pointImage: { maxWidth: 24, maxHeight: 24 },
      }), type);
      expect(builder.xAxis.tickSize).toBe(12);
    }
  });
});
