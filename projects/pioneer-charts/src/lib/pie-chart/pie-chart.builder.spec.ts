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

function config(donut?: Partial<PcacPieDonutConfig>): PcacPieChartConfig {
  return {
    height: 200,
    donut,
    data: [
      { key: 'A', value: 3, hide: false, data: [] },
      { key: 'B', value: 1, hide: false, data: [] },
    ],
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
    builder.buildChart(elm, config());

    expect(innerRadius()).toBe(0);
    expect(center()).toBeNull();
  });

  it('takes the default hole size from {}', () => {
    builder.buildChart(elm, config({}));

    expect(innerRadius()).toBeCloseTo(outerRadius() * 0.6);
  });

  it('clamps innerRadius to 0-0.9', () => {
    builder.buildChart(elm, config({ innerRadius: 2 }));
    expect(innerRadius()).toBeCloseTo(outerRadius() * 0.9);

    builder.buildChart(elm, config({ innerRadius: -1 }));
    expect(innerRadius()).toBe(0);
  });

  it('draws no center group without a label or subLabel', () => {
    builder.buildChart(elm, config({}));

    expect(center()).toBeNull();
  });

  it('draws the label and subLabel in the center, ignoring the pointer', () => {
    builder.buildChart(elm, config({ label: '67', subLabel: 'balls' }));

    const group = center();
    expect(group?.getAttribute('pointer-events')).toBe('none');
    expect(group?.querySelector('.pcac-pie-center-label')?.textContent).toBe('67');
    expect(group?.querySelector('.pcac-pie-center-sub-label')?.textContent).toBe('balls');
  });

  it('draws no center text on a plain pie even when given a label', () => {
    builder.buildChart(elm, config({ innerRadius: 0, label: '67' }));

    expect(center()).toBeNull();
  });

  it('sets the label colors as custom properties only when configured', () => {
    builder.buildChart(elm, config({ label: '67', labelColor: 'red' }));

    const group = center() as SVGGElement;
    expect(group.style.getPropertyValue('--pcac-pie-center-label-color')).toBe('red');
    expect(group.style.getPropertyValue('--pcac-pie-center-sub-label-color')).toBe('');
  });
});
