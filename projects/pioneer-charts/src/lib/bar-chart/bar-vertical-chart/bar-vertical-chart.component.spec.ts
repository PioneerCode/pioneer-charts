import { TestBed } from '@angular/core/testing';
import { PcacTooltipBuilder } from '../../core/tooltip.builder';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { PcacBarVerticalChartComponent } from './bar-vertical-chart.component';
import { PcacBarVerticalChartConfig } from './bar-vertical-chart.model';

describe('PcacBarVerticalChartComponent', () => {
  beforeAll(() => {
    // jsdom has no ResizeObserver, which every chart component uses.
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterAll(() => vi.unstubAllGlobals());

  // Regression test: a chart removed while hovered (an @if flip, a route change) gets no mouseout,
  // so the shared tooltip stayed on screen after its chart was gone.
  it('closes its tooltip when destroyed while hovered', () => {
    const fixture = TestBed.createComponent(PcacBarVerticalChartComponent);
    fixture.componentRef.setInput('config', { ...new PcacBarVerticalChartConfig(), data: [] });
    fixture.detectChanges();

    const builder = fixture.debugElement.injector.get(BarVerticalChartBuilder);
    builder.showTooltip(new MouseEvent('mousemove'), { key: 'k', value: 1, hide: false, data: [] }, { index: 0 });
    const shell = TestBed.inject(PcacTooltipBuilder).tooltip.node() as HTMLDivElement;
    expect(shell.style.display).toBe('inline-block');

    fixture.destroy();

    expect(shell.style.display).toBe('none');
  });
});
