import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PcacPieChart } from './pie/pie.component';
import { PcacDonutChart } from './donut/donut.component';
import { PcacPieChartConfig } from './pie/pie.model';
import { PcacDonutChartConfig } from './donut/donut.model';
import { PcacData } from '../core/chart.model';

const slices = (): PcacData[] => [
  { key: 'A', value: 3, hide: false, data: [] },
  { key: 'B', value: 1, hide: false, data: [] },
];

@Component({
  selector: 'pcac-pie-donut-wrappers-test-host',
  imports: [PcacPieChart, PcacDonutChart],
  template: `
    <pcac-pie-chart [config]="pie()" (sliceClicked)="clicked.push(['pie', $event])" />
    <pcac-donut-chart [config]="donut()" (sliceClicked)="clicked.push(['donut', $event])" />
  `,
})
class TestHostComponent {
  readonly clicked: [string, PcacData][] = [];
  readonly pie = signal<PcacPieChartConfig>({ ...new PcacPieChartConfig(), data: slices() });
  readonly donut = signal<PcacDonutChartConfig>({ ...new PcacDonutChartConfig(), label: '4', subLabel: 'total', data: slices() });
}

describe('pie/donut wrappers', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', class { observe() { /* noop */ } unobserve() { /* noop */ } disconnect() { /* noop */ } });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 400 });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete (HTMLElement.prototype as unknown as { clientWidth?: number }).clientWidth;
  });

  it.each(['pie', 'donut'])('%s wrapper forwards sliceClicked from the inner chart', async (kind) => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const slice = fixture.nativeElement.querySelectorAll(`pcac-${kind}-chart .pcac-arc path`)[1] as Element;

    slice.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(fixture.componentInstance.clicked).toEqual([[kind, slices()[1]]]);
  });

  it('draws the pie as a pie and the donut as a ring with its center label', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const svg = (kind: string) => fixture.nativeElement.querySelector(`pcac-${kind}-chart svg`) as SVGSVGElement;

    expect(svg('pie').getAttribute('aria-label')).toBe('Pie chart');
    expect(svg('pie').querySelector('.pcac-donut-center')).toBeNull();
    expect(svg('donut').getAttribute('aria-label')).toBe('Donut chart');
    expect(svg('donut').querySelector('.pcac-donut-center-label')?.textContent).toBe('4');
  });
});
