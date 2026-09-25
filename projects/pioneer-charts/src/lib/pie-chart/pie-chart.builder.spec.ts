import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PieChartBuilder } from './pie-chart.builder';
import { PcacPieChartConfig } from './pie-chart.model';

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

function config(hidden: string[] = []): PcacPieChartConfig {
  return {
    height: 200,
    data: ['A', 'B', 'C'].map((key) => ({ key, value: 1, hide: hidden.includes(key), data: [] })),
  };
}

describe('PieChartBuilder data handling', () => {
  let builder: PieChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieChartBuilder());
  });

  it('clears the previous pie when the data is emptied', () => {
    const elm = chartElm();
    builder.buildChart(elm, config());
    builder.buildChart(elm, { ...config(), data: [] });

    expect(elm.nativeElement.querySelectorAll('.pcac-arc')).toHaveLength(0);
  });

  it('gives a hidden slice no angle while keeping its place, and so its color', () => {
    const elm = chartElm();
    builder.buildChart(elm, config(['B']));

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
    builder.buildChart(allShown, config());
    const shownFill = (allShown.nativeElement.querySelectorAll('.pcac-arc path')[2] as SVGPathElement).style.fill;
    expect(shownFill).not.toBe('');
    expect(arcs[2].style.fill).toBe(shownFill);
  });
});
