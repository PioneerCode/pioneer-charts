import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PieDonutChartBuilder } from './pie-donut-chart.builder';
import { PcacPieDonutChartConfig, PcacPieDonutChartType } from './pie-donut-chart.model';
import { PcacDonutChartConfig } from './donut/donut.model';

const { Pie, Donut } = PcacPieDonutChartType;
import { Arc, PieArcDatum } from 'd3-shape';
import { PcacData } from '../core/chart.model';

/**
 * Same technique as core/chart.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`,
 * since `initializeChartState` needs a genuine node to run `d3.select(...)` on.
 */
function chartElm(width = 400): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function donutConfig(donut: Partial<PcacDonutChartConfig> = {}): PcacDonutChartConfig {
  return {
    height: 200,
    ...donut,
    data: [
      { key: 'A', value: 3, hide: false, data: [] },
      { key: 'B', value: 1, hide: false, data: [] },
    ],
  };
}

function colorConfig(colorOverride?: string[]): PcacPieDonutChartConfig {
  return {
    height: 200,
    colorOverride,
    data: ['A', 'B', 'C'].map((key) => ({ key, value: 1, hide: false, data: [] })),
  };
}

function dataConfig(hidden: string[] = []): PcacPieDonutChartConfig {
  return {
    height: 200,
    data: ['A', 'B', 'C'].map((key) => ({ key, value: 1, hide: hidden.includes(key), data: [] })),
  };
}

describe('PieDonutChartBuilder donut', () => {
  let builder: PieDonutChartBuilder;
  let elm: ElementRef;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieDonutChartBuilder());
    elm = chartElm();
  });

  /** The inner radius the builder settled on, read back from its arc generator. */
  function innerRadius(): number {
    return (builder as unknown as { innerRadius: number }).innerRadius;
  }

  function outerRadius(): number {
    // height 200 -> radius 100, less the builder's 10px hover allowance.
    return 90;
  }

  function center(): Element | null {
    return elm.nativeElement.querySelector('.pcac-donut-center');
  }

  // Regression test: an innerRadius of NaN (an empty number input's value, say) got through the
  // 0-0.9 clamp and made every slice's path NaN, so nothing drew.
  it('falls back to the default hole for an innerRadius that isn\'t a number', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: NaN }), Donut);

    expect(innerRadius()).toBeCloseTo(outerRadius() * 0.6);
  });

  it('warns once, in development, when a pie config still carries 22.2\'s donut option', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const leftover = { ...dataConfig(), donut: { label: '67' } } as PcacPieDonutChartConfig;

    builder.buildChart(elm, leftover, Pie);
    builder.buildChart(elm, leftover, Pie);
    builder.buildChart(chartElm(), dataConfig(), Pie);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('<pcac-donut-chart>');
    warn.mockRestore();
  });

  it('doesn\'t warn for a pie config without donut', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    builder.buildChart(elm, dataConfig(), Pie);

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('draws the pie chart without a hole, ignoring any ring settings on its config', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: 0.6, label: '67' }), Pie);

    expect(innerRadius()).toBe(0);
    expect(center()).toBeNull();
  });

  it('takes the default hole size when innerRadius isn\'t set', () => {
    builder.buildChart(elm, donutConfig({}), Donut);

    expect(innerRadius()).toBeCloseTo(outerRadius() * 0.6);
  });

  it('clamps innerRadius to 0-0.9', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: 2 }), Donut);
    expect(innerRadius()).toBeCloseTo(outerRadius() * 0.9);

    builder.buildChart(elm, donutConfig({ innerRadius: -1 }), Donut);
    expect(innerRadius()).toBe(0);
  });

  it('draws no center group without a label or subLabel', () => {
    builder.buildChart(elm, donutConfig({}), Donut);

    expect(center()).toBeNull();
  });

  it('draws the label and subLabel in the center, ignoring the pointer', () => {
    builder.buildChart(elm, donutConfig({ label: '67', subLabel: 'balls' }), Donut);

    const group = center();
    expect(group?.getAttribute('pointer-events')).toBe('none');
    expect(group?.querySelector('.pcac-donut-center-label')?.textContent).toBe('67');
    expect(group?.querySelector('.pcac-donut-center-sub-label')?.textContent).toBe('balls');
  });

  it('shrinks a long label to fit across the hole', () => {
    // jsdom can't measure text, so the builder estimates 0.6em per glyph: 15 chars at the
    // preferred 27px (0.5 x the 54px hole radius) is 243px, wider than the 86.4px allowed, so it
    // shrinks to 9.6px - still above the 8px floor.
    builder.buildChart(elm, donutConfig({ label: 'A long label xx' }), Donut);

    const text = center()?.querySelector('.pcac-donut-center-label') as SVGTextElement;
    expect(parseFloat(text.style.fontSize)).toBeCloseTo(9.6);
  });

  it('leaves out a line that cannot fit at a readable size', () => {
    builder.buildChart(elm, donutConfig({ label: '67', subLabel: 'a sub label far too long to fit' }), Donut);

    expect(center()?.querySelector('.pcac-donut-center-label')?.textContent).toBe('67');
    expect(center()?.querySelector('.pcac-donut-center-sub-label')).toBeNull();
  });

  it('draws no center text when the hole is too small for any', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: 0.05, label: '67', subLabel: 'balls' }), Donut);

    expect(center()).toBeNull();
  });

  it('draws no center text on a plain pie even when given a label', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: 0, label: '67' }), Donut);

    expect(center()).toBeNull();
  });

  it('sets the label colors as custom properties only when configured', () => {
    builder.buildChart(elm, donutConfig({ label: '67', labelColor: 'red' }), Donut);

    const group = center() as SVGGElement;
    expect(group.style.getPropertyValue('--pcac-donut-center-label-color')).toBe('red');
    expect(group.style.getPropertyValue('--pcac-donut-center-sub-label-color')).toBe('');
  });
});

describe('PieDonutChartBuilder colors', () => {
  let builder: PieDonutChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieDonutChartBuilder());
  });

  it('uses the theme palette without an override, or with an empty one', () => {
    builder.buildChart(chartElm(), colorConfig(), Pie);
    const palette = [...builder.colors];

    builder.buildChart(chartElm(), colorConfig([]), Pie);

    expect(palette.length).toBeGreaterThanOrEqual(3);
    expect(builder.colors).toEqual(palette);
  });

  it('colors slices from colorOverride in order, repeating it when short', () => {
    builder.buildChart(chartElm(), colorConfig(['#111', '#222']), Pie);

    expect(builder.colors).toEqual(['#111', '#222', '#111']);
  });
});

describe('PieDonutChartBuilder data handling', () => {
  let builder: PieDonutChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieDonutChartBuilder());
  });

  it('clears the previous pie when the data is emptied', () => {
    const elm = chartElm();
    builder.buildChart(elm, dataConfig(), Pie);
    builder.buildChart(elm, { ...dataConfig(), data: [] }, Pie);

    expect(elm.nativeElement.querySelectorAll('.pcac-arc')).toHaveLength(0);
  });

  it('gives a hidden slice no angle while keeping its place, and so its color', () => {
    const elm = chartElm();
    builder.buildChart(elm, dataConfig(['B']), Pie);

    const arcs = Array.from(elm.nativeElement.querySelectorAll('.pcac-arc path')) as SVGPathElement[];
    const angles = arcs.map((path) => {
      const d = (path as unknown as { __data__: { startAngle: number; endAngle: number } }).__data__;
      return d.endAngle - d.startAngle;
    });
    expect(arcs).toHaveLength(3);
    expect(angles[1]).toBe(0);
    expect(angles[0]).toBeCloseTo(Math.PI);

    // The slice after the hidden one keeps the color it has with nothing hidden.
    const allShown = chartElm();
    builder.buildChart(allShown, dataConfig(), Pie);
    const shownFill = (allShown.nativeElement.querySelectorAll('.pcac-arc path')[2] as SVGPathElement).style.fill;
    expect(shownFill).not.toBe('');
    expect(arcs[2].style.fill).toBe(shownFill);
  });

  it('names itself a pie chart for screen readers when no ariaLabel is given', () => {
    const elm = chartElm();
    builder.buildChart(elm, dataConfig(), Pie);

    expect(elm.nativeElement.getAttribute('aria-label')).toBe('Pie chart');
  });

  it('names a donut chart for what it draws: a donut, or a pie when its hole is 0', () => {
    const elm = chartElm();
    builder.buildChart(elm, dataConfig(), Donut);
    expect(elm.nativeElement.getAttribute('aria-label')).toBe('Donut chart');

    builder.buildChart(elm, { ...dataConfig(), innerRadius: 0 } as PcacDonutChartConfig, Donut);
    expect(elm.nativeElement.getAttribute('aria-label')).toBe('Pie chart');
  });
});

describe('PieDonutChartBuilder sizing and hover', () => {
  let builder: PieDonutChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieDonutChartBuilder());
  });

  afterEach(() => vi.restoreAllMocks());

  // Regression test: the outer radius was the radius less a 10px hover allowance, unclamped - so a
  // pie under 20px across got a negative radius, and d3 drew it inside out.
  it('never gives the pie a negative radius when it is very short', () => {
    builder.buildChart(chartElm(), { ...dataConfig(), height: 12 }, Pie);

    const shapes = builder as unknown as Record<'arcShape' | 'arcOverShape', Arc<unknown, PieArcDatum<PcacData>>>;
    expect(shapes.arcShape.outerRadius()({} as PieArcDatum<PcacData>)).toBe(0);
    // Nor does it pop a disc out on hover, though nothing shows at rest.
    expect(shapes.arcOverShape.outerRadius()({} as PieArcDatum<PcacData>)).toBe(0);
  });

  // Regression test: hovering a slice mid-way through the enter sweep grew it straight from its
  // part-swept path, morphing it oddly. It now finishes the slice first.
  it('finishes a slice hovered during the enter sweep before growing it', async () => {
    const duration = 300;
    vi.spyOn(builder.transitionService, 'getTransitionDuration').mockReturnValue(duration);
    const elm = chartElm();
    builder.buildChart(elm, dataConfig(), Pie);
    const slice = elm.nativeElement.querySelector('.pcac-arc path') as SVGPathElement;
    await new Promise((resolve) => setTimeout(resolve, duration / 4));

    slice.dispatchEvent(new MouseEvent('mouseover'));

    const shape = (builder as unknown as { arcShape: Arc<unknown, PieArcDatum<PcacData>> }).arcShape;
    const datum = (slice as unknown as { __data__: PieArcDatum<PcacData> }).__data__;
    expect(slice.getAttribute('d')).toBe(shape(datum));
  });

  // Regression test: the snap to the resting shape ran on every mouseover, so re-entering a slice
  // part-way through its hover shrink jumped it back to rest before growing it again (a flicker).
  it('grows a slice re-entered mid-shrink from where it is', async () => {
    const duration = 60;
    vi.spyOn(builder.transitionService, 'getTransitionDuration').mockReturnValue(duration);
    const elm = chartElm();
    builder.buildChart(elm, dataConfig(), Pie);
    const slice = elm.nativeElement.querySelector('.pcac-arc path') as SVGPathElement;
    await new Promise((resolve) => setTimeout(resolve, duration * 2));

    slice.dispatchEvent(new MouseEvent('mouseover'));
    await new Promise((resolve) => setTimeout(resolve, duration));
    slice.dispatchEvent(new MouseEvent('mouseout'));
    await new Promise((resolve) => setTimeout(resolve, duration / 6));
    const midShrink = slice.getAttribute('d');
    slice.dispatchEvent(new MouseEvent('mouseover'));

    const shape = (builder as unknown as { arcShape: Arc<unknown, PieArcDatum<PcacData>> }).arcShape;
    const datum = (slice as unknown as { __data__: PieArcDatum<PcacData> }).__data__;
    expect(midShrink).not.toBe(shape(datum));
    expect(slice.getAttribute('d')).toBe(midShrink);
  });
});
