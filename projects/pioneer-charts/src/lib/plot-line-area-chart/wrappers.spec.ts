import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PcacLineChart } from './line/line.component';
import { PcacAreaChart } from './area/area.component';
import { PcacPlotChart } from './plot/plot.component';
import { PcacLineAreaChartConfig } from './plot-line-area-chart.model';
import { PcacData } from '../core/chart.model';

// Regression test: only the plot wrapper forwarded the inner chart's dotClicked; the line and
// area wrappers declared the output but never emitted it.
@Component({
  selector: 'pcac-wrappers-test-host',
  imports: [PcacLineChart, PcacAreaChart, PcacPlotChart],
  template: `
    <pcac-line-chart [config]="config()" (dotClicked)="clicked.push(['line', $event])" />
    <pcac-area-chart [config]="config()" (dotClicked)="clicked.push(['area', $event])" />
    <pcac-plot-chart [config]="config()" (dotClicked)="clicked.push(['plot', $event])" />
  `,
})
class TestHostComponent {
  readonly clicked: [string, PcacData][] = [];
  readonly config = signal<PcacLineAreaChartConfig>({
    ...new PcacLineAreaChartConfig(),
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    data: [{ key: 's', value: null, hide: false, data: [{ key: 1, value: 5, hide: false, data: [] }, { key: 2, value: 8, hide: false, data: [] }] }],
  });
}

describe('line/area/plot wrappers', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', class { observe() { /* noop */ } unobserve() { /* noop */ } disconnect() { /* noop */ } });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 600 });
    (SVGElement.prototype as unknown as { getTotalLength: () => number }).getTotalLength = () => 100;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete (HTMLElement.prototype as unknown as { clientWidth?: number }).clientWidth;
    delete (SVGElement.prototype as unknown as { getTotalLength?: () => number }).getTotalLength;
  });

  it.each(['line', 'area', 'plot'])('%s wrapper forwards dotClicked from the inner chart', async (kind) => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const point = fixture.nativeElement.querySelector(`pcac-${kind}-chart .point:nth-child(2)`) as Element;

    point.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(fixture.componentInstance.clicked).toEqual([[kind, { key: 2, value: 8, hide: false, data: [] }]]);
  });
});
