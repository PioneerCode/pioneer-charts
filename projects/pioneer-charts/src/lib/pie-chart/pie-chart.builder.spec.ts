import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PieChartBuilder } from './pie-chart.builder';
import { PcacPieChartConfig, PcacPieDonutConfig } from './pie-chart.model';

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

function donutConfig(donut?: Partial<PcacPieDonutConfig>): PcacPieChartConfig {
  return {
    height: 200,
    donut,
    data: [
      { key: 'A', value: 3, hide: false, data: [] },
      { key: 'B', value: 1, hide: false, data: [] },
    ],
  };
}

function colorConfig(colorOverride?: string[]): PcacPieChartConfig {
  return {
    height: 200,
    colorOverride,
    data: ['A', 'B', 'C'].map((key) => ({ key, value: 1, hide: false, data: [] })),
  };
}

function dataConfig(hidden: string[] = []): PcacPieChartConfig {
  return {
    height: 200,
    data: ['A', 'B', 'C'].map((key) => ({ key, value: 1, hide: hidden.includes(key), data: [] })),
  };
}

describe('PieChartBuilder donut', () => {
  let builder: PieChartBuilder;
  let elm: ElementRef;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieChartBuilder());
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
    return elm.nativeElement.querySelector('.pcac-pie-center');
  }

  it('draws a plain pie when donut is not set', () => {
    builder.buildChart(elm, donutConfig());

    expect(innerRadius()).toBe(0);
    expect(center()).toBeNull();
  });

  it('takes the default hole size from {}', () => {
    builder.buildChart(elm, donutConfig({}));

    expect(innerRadius()).toBeCloseTo(outerRadius() * 0.6);
  });

  it('clamps innerRadius to 0-0.9', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: 2 }));
    expect(innerRadius()).toBeCloseTo(outerRadius() * 0.9);

    builder.buildChart(elm, donutConfig({ innerRadius: -1 }));
    expect(innerRadius()).toBe(0);
  });

  it('draws no center group without a label or subLabel', () => {
    builder.buildChart(elm, donutConfig({}));

    expect(center()).toBeNull();
  });

  it('draws the label and subLabel in the center, ignoring the pointer', () => {
    builder.buildChart(elm, donutConfig({ label: '67', subLabel: 'balls' }));

    const group = center();
    expect(group?.getAttribute('pointer-events')).toBe('none');
    expect(group?.querySelector('.pcac-pie-center-label')?.textContent).toBe('67');
    expect(group?.querySelector('.pcac-pie-center-sub-label')?.textContent).toBe('balls');
  });

  it('shrinks a long label to fit across the hole', () => {
    // jsdom can't measure text, so the builder estimates 0.6em per glyph: 15 chars at the
    // preferred 27px (0.5 x the 54px hole radius) is 243px, wider than the 86.4px allowed, so it
    // shrinks to 9.6px - still above the 8px floor.
    builder.buildChart(elm, donutConfig({ label: 'A long label xx' }));

    const text = center()?.querySelector('.pcac-pie-center-label') as SVGTextElement;
    expect(parseFloat(text.style.fontSize)).toBeCloseTo(9.6);
  });

  it('leaves out a line that cannot fit at a readable size', () => {
    builder.buildChart(elm, donutConfig({ label: '67', subLabel: 'a sub label far too long to fit' }));

    expect(center()?.querySelector('.pcac-pie-center-label')?.textContent).toBe('67');
    expect(center()?.querySelector('.pcac-pie-center-sub-label')).toBeNull();
  });

  it('draws no center text when the hole is too small for any', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: 0.05, label: '67', subLabel: 'balls' }));

    expect(center()).toBeNull();
  });

  it('draws no center text on a plain pie even when given a label', () => {
    builder.buildChart(elm, donutConfig({ innerRadius: 0, label: '67' }));

    expect(center()).toBeNull();
  });

  it('sets the label colors as custom properties only when configured', () => {
    builder.buildChart(elm, donutConfig({ label: '67', labelColor: 'red' }));

    const group = center() as SVGGElement;
    expect(group.style.getPropertyValue('--pcac-pie-center-label-color')).toBe('red');
    expect(group.style.getPropertyValue('--pcac-pie-center-sub-label-color')).toBe('');
  });
});

describe('PieChartBuilder colors', () => {
  let builder: PieChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieChartBuilder());
  });

  it('uses the theme palette without an override, or with an empty one', () => {
    builder.buildChart(chartElm(), colorConfig());
    const palette = [...builder.colors];

    builder.buildChart(chartElm(), colorConfig([]));

    expect(palette.length).toBeGreaterThanOrEqual(3);
    expect(builder.colors).toEqual(palette);
  });

  it('colors slices from colorOverride in order, repeating it when short', () => {
    builder.buildChart(chartElm(), colorConfig(['#111', '#222']));

    expect(builder.colors).toEqual(['#111', '#222', '#111']);
  });
});

describe('PieChartBuilder data handling', () => {
  let builder: PieChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieChartBuilder());
  });

  it('clears the previous pie when the data is emptied', () => {
    const elm = chartElm();
    builder.buildChart(elm, dataConfig());
    builder.buildChart(elm, { ...dataConfig(), data: [] });

    expect(elm.nativeElement.querySelectorAll('.pcac-arc')).toHaveLength(0);
  });

  it('gives a hidden slice no angle while keeping its place, and so its color', () => {
    const elm = chartElm();
    builder.buildChart(elm, dataConfig(['B']));

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
    builder.buildChart(allShown, dataConfig());
    const shownFill = (allShown.nativeElement.querySelectorAll('.pcac-arc path')[2] as SVGPathElement).style.fill;
    expect(shownFill).not.toBe('');
    expect(arcs[2].style.fill).toBe(shownFill);
  });
});
