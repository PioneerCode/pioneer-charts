import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PcacBarVerticalChartComponent } from '../bar-chart/bar-vertical-chart/bar-vertical-chart.component';
import { PcacBarVerticalChartConfig } from '../bar-chart/bar-vertical-chart/bar-vertical-chart.model';
import { PcacLineChart } from '../plot-line-area-chart/line/line.component';
import { PcacLineChartConfig } from '../plot-line-area-chart/line/line.model';
import { PcacTooltipBuilder } from './tooltip.builder';
import { PcacTooltipDirective } from './tooltip.directive';

/**
 * End-to-end wiring of `<ng-template pcacTooltip>`: projected into a real chart component, picked
 * up by its content query, handed to the builder, and rendered by the chart's own D3 hover handler
 * with the hovered datum and its parent. Covers a directly-rendering chart (bar-vertical) and one
 * behind a wrapper (line), since the wrapper has to forward the query explicitly - content queries
 * don't see through `<ng-content>` - and that forwarding is the easy thing to forget.
 */
@Component({
  selector: 'pcac-tooltip-directive-test-host',
  imports: [PcacBarVerticalChartComponent, PcacLineChart, PcacTooltipDirective],
  template: `
    <pcac-bar-vertical-chart [config]="barConfig()">
      <ng-template pcacTooltip let-point let-group="parent">
        <div class="bar-tip">{{ group?.key }} > {{ point.key }} = {{ point.value }}</div>
      </ng-template>
    </pcac-bar-vertical-chart>
    <pcac-line-chart [config]="lineConfig()">
      <ng-template pcacTooltip let-point let-series="parent">
        <div class="line-tip">{{ series?.key }} @ {{ point.key }} = {{ point.value }}</div>
      </ng-template>
    </pcac-line-chart>
  `,
})
class TestHostComponent {
  readonly barConfig = signal<PcacBarVerticalChartConfig>({
    ...new PcacBarVerticalChartConfig(),
    data: [
      { key: 'Q1', value: null, hide: false, data: [{ key: 'North', value: 10, hide: false, data: [] }] },
      { key: 'Q2', value: null, hide: false, data: [{ key: 'South', value: 20, hide: false, data: [] }] },
    ],
  });

  readonly lineConfig = signal<PcacLineChartConfig>({
    ...new PcacLineChartConfig(),
    enableEffects: false,
    enableZoom: false,
    data: [
      { key: 'Temp', value: null, hide: false, data: [
        { key: 1, value: 5, hide: false, data: [] },
        { key: 2, value: 8, hide: false, data: [] },
      ] },
    ],
  });
}

describe('PcacTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let shell: HTMLDivElement;

  beforeAll(() => {
    // jsdom has neither ResizeObserver nor layout: the charts only draw once their container
    // measures a real width, and the line chart sizes its enter animation from path geometry.
    vi.stubGlobal('ResizeObserver', class { observe() { /* noop */ } unobserve() { /* noop */ } disconnect() { /* noop */ } });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 600 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 300 });
    const proto = SVGElement.prototype as unknown as { getBBox: () => DOMRect; getTotalLength: () => number };
    proto.getBBox = () => ({ x: 0, y: 0, width: 40, height: 12 }) as DOMRect;
    proto.getTotalLength = () => 100;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete (HTMLElement.prototype as unknown as { clientWidth?: number }).clientWidth;
    delete (HTMLElement.prototype as unknown as { clientHeight?: number }).clientHeight;
    delete (SVGElement.prototype as unknown as { getBBox?: () => DOMRect }).getBBox;
    delete (SVGElement.prototype as unknown as { getTotalLength?: () => number }).getTotalLength;
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    shell = TestBed.inject(PcacTooltipBuilder).tooltip.node() as HTMLDivElement;
  });

  afterEach(() => {
    TestBed.inject(PcacTooltipBuilder).hideTooltip();
  });

  it('renders the projected template for a hovered bar, with its group as the parent', () => {
    const bars = fixture.nativeElement.querySelectorAll('pcac-bar-vertical-chart .pcac-bar');
    expect(bars.length).toBe(2);

    bars[1].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

    expect(shell.style.display).toBe('inline-block');
    expect(shell.classList.contains('pcac-d3-tooltip-default')).toBe(false);
    expect(shell.querySelector('.bar-tip')?.textContent).toBe('Q2 > South = 20');
  });

  it('renders the projected template for a hovered line point, with its series as the parent (forwarded through the wrapper)', () => {
    const points = fixture.nativeElement.querySelectorAll('pcac-line-chart .point');
    expect(points.length).toBe(2);

    points[1].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    expect(shell.querySelector('.line-tip')?.textContent).toBe('Temp @ 2 = 8');
  });

  it('tears the template down again on mouseout', () => {
    const bar = fixture.nativeElement.querySelector('pcac-bar-vertical-chart .pcac-bar');
    bar.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    bar.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

    expect(shell.style.display).toBe('none');
    expect(shell.querySelector('.bar-tip')).toBeNull();
  });
});
