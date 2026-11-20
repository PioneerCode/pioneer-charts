import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PcacData } from '../core/chart.model';
import { PcacTooltipDirective } from '../core/tooltip.directive';
import { PcacTooltipBuilder } from '../core/tooltip.builder';
import { StateTimelineBuilder } from './state-timeline.builder';
import { PcacStateTimeline } from './state-timeline.component';
import { PcacStateTimelineConfig } from './state-timeline.model';

const day = (key: string, ok: number, error: number): PcacData => ({
  key, value: 24, hide: false,
  data: [{ key: 'ok', value: ok, hide: false, data: [] }, { key: 'error', value: error, hide: false, data: [] }],
});

const config = (periods: PcacData[]): PcacStateTimelineConfig => ({
  height: 14,
  states: [{ key: 'ok', label: 'OK' }, { key: 'error', label: 'Error' }],
  data: [{ key: 'Disk', value: null, hide: false, data: periods }],
});

@Component({
  selector: 'pcac-state-timeline-test-host',
  imports: [PcacStateTimeline, PcacTooltipDirective],
  template: `
    <div class="host">
      <pcac-state-timeline [config]="config()" (periodClicked)="clicked.push($event)">
        <ng-template pcacTooltip let-period let-row="parent">
          <span class="tip">{{ row?.key }} on {{ period.key }}</span>
        </ng-template>
      </pcac-state-timeline>
    </div>`,
})
class TestHostComponent {
  readonly config = signal(config([day('Mon', 24, 0), day('Tue', 20, 4)]));
  readonly clicked: PcacData[] = [];
}

describe('PcacStateTimeline', () => {
  beforeAll(() => {
    // jsdom has no ResizeObserver, which every chart component uses.
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    // Nor layout: the chart's section gets a width to draw in.
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return 300; } });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
  });

  afterEach(() => TestBed.inject(PcacTooltipBuilder).hideTooltip());

  const periods = (fixture: { nativeElement: HTMLElement }) =>
    Array.from(fixture.nativeElement.querySelectorAll<SVGGElement>('.pcac-state-period'));

  it('draws the config, and again when it changes', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    expect(periods(fixture).length).toBe(2);

    fixture.componentInstance.config.set(config([day('Mon', 24, 0), day('Tue', 20, 4), day('Wed', 0, 24)]));
    await fixture.whenStable();
    expect(periods(fixture).map((g) => g.getAttribute('aria-label'))).toEqual([
      'Disk, Mon: OK 100%', 'Disk, Tue: Error 17%, OK 83%', 'Disk, Wed: Error 100%',
    ]);
  });

  it('passes a clicked period on', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    periods(fixture)[1].dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.clicked.map((d) => d.key)).toEqual(['Tue']);
  });

  it('shows its tooltip template for a hovered period, given its row', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    periods(fixture)[1].dispatchEvent(new MouseEvent('mouseover'));
    await fixture.whenStable();
    const shell = TestBed.inject(PcacTooltipBuilder).tooltip.node() as HTMLDivElement;
    expect(shell.textContent!.trim()).toBe('Disk on Tue');
  });

  it('closes its tooltip when destroyed while hovered', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    periods(fixture)[0].dispatchEvent(new MouseEvent('mouseover'));
    const shell = TestBed.inject(PcacTooltipBuilder).tooltip.node() as HTMLDivElement;
    expect(shell.style.display).toBe('inline-block');

    fixture.destroy();

    expect(shell.style.display).toBe('none');
  });

  describe('its colors', () => {
    /** The rule the component's stylesheet gives a selector, as the page has it. */
    const rule = async (selector: string) => {
      const fixture = TestBed.createComponent(TestHostComponent);
      await fixture.whenStable();
      const css = Array.from(document.querySelectorAll('style')).map((s) => s.textContent).join('\n').replace(/\s+/g, ' ');
      const found = new RegExp(`${selector.replace(/[.]/g, '\\.')} ?\\{([^}]*)\\}`).exec(css);
      expect(found, selector).not.toBeNull();
      return found![1];
    };

    // Told apart by lightness as well as hue, so a red-green color-blind reader can (dataviz's palette check):
    // OK pale and quiet, Warning and Error strong
    it('draws OK pale, and Warning and Error strong, unless a stylesheet says otherwise', async () => {
      expect(await rule('.pcac-state-ok')).toContain('var(--pcac-state-timeline-ok-color, #98c9b2)');
      expect(await rule('.pcac-state-warning')).toContain('var(--pcac-state-timeline-warning-color, #d97706)');
      expect(await rule('.pcac-state-error')).toContain('var(--pcac-state-timeline-error-color, #bb2d3b)');
      expect(await rule('.pcac-state-unknown .pcac-state-fill')).toContain('var(--pcac-state-timeline-unknown-color, #e9ecef)');
    });

    // At 40%, a period with a little Error was a pale pink beside OK's pale green: hard to tell apart for anyone
    it('draws a state from 75% of its color, all of it the more of the period it took', async () => {
      expect(await rule('.pcac-state-fill')).toContain('calc(75% + var(--pcac-state-share, 1) * 25%)');
    });
  });

  it('has its own builder, so two timelines on a page don\'t share one', async () => {
    const first = TestBed.createComponent(TestHostComponent);
    const second = TestBed.createComponent(TestHostComponent);
    await first.whenStable();
    await second.whenStable();
    const builderOf = (f: typeof first) =>
      f.debugElement.children[0].children[0].injector.get(StateTimelineBuilder);
    expect(builderOf(first)).not.toBe(builderOf(second));
  });
});
