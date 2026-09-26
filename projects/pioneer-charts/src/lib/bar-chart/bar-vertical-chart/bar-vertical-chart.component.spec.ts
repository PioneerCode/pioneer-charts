import { TestBed } from '@angular/core/testing';
import { PcacTooltipBuilder } from '../../core/tooltip.builder';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { PcacBarVerticalChartComponent } from './bar-vertical-chart.component';
import { PcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { PcacColorService } from '../../core/color.service';

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

  // Regression test: the palette wasn't reactive, so `PcacColorService.setScale()` (e.g. a theme
  // toggle) left every chart on screen in the old colors until its config next changed. The
  // container here is never laid out (jsdom), which is also the case the first build of a real
  // chart can hit - it must still pick up palette changes.
  it('redraws when the palette changes, even before its container is laid out', async () => {
    const fixture = TestBed.createComponent(PcacBarVerticalChartComponent);
    fixture.componentRef.setInput('config', {
      ...new PcacBarVerticalChartConfig(),
      data: [{ key: 'g', value: null, hide: false, data: [{ key: 'a', value: 1, hide: false, data: [] }] }],
    });
    await fixture.whenStable();
    const build = vi.spyOn(fixture.debugElement.injector.get(BarVerticalChartBuilder), 'buildChart');

    TestBed.inject(PcacColorService).setScale(['#123456']);
    await fixture.whenStable();

    expect(build).toHaveBeenCalledTimes(1);
  });
});
