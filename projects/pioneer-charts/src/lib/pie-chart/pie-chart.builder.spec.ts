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

function config(colorOverride?: string[]): PcacPieChartConfig {
  return {
    height: 200,
    colorOverride,
    data: ['A', 'B', 'C'].map((key) => ({ key, value: 1, hide: false, data: [] })),
  };
}

describe('PieChartBuilder colors', () => {
  let builder: PieChartBuilder;

  beforeEach(() => {
    builder = TestBed.runInInjectionContext(() => new PieChartBuilder());
  });

  it('uses the theme palette without an override, or with an empty one', () => {
    builder.buildChart(chartElm(), config());
    const palette = [...builder.colors];

    builder.buildChart(chartElm(), config([]));

    expect(palette.length).toBeGreaterThanOrEqual(3);
    expect(builder.colors).toEqual(palette);
  });

  it('colors slices from colorOverride in order, repeating it when short', () => {
    builder.buildChart(chartElm(), config(['#111', '#222']));

    expect(builder.colors).toEqual(['#111', '#222', '#111']);
  });
});
