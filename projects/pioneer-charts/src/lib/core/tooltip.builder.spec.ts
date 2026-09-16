import { Component, TemplateRef, signal, viewChild } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PcacTooltipBuilder } from './tooltip.builder';
import { PcacTooltipContext } from './tooltip.directive';
import { PcacData, PcacFormatEnum } from './chart.model';

/**
 * Declares two templates for the builder to render. They live on a real component (rather than
 * being conjured up some other way) because that's the only place a `TemplateRef` comes from, and
 * because it lets the templates use the things a consumer's would: pipes, and the component's own
 * state (`label` is a signal so a test can prove the rendered view keeps tracking it while shown).
 */
@Component({
  selector: 'pcac-tooltip-builder-test-host',
  imports: [UpperCasePipe],
  template: `
    <ng-template #full let-point let-group="parent" let-threshold="isThreshold">
      <div class="custom">{{ label() }}: {{ group?.key }} / {{ point.key | uppercase }} = {{ point.value }}{{ threshold ? ' (threshold)' : '' }}</div>
    </ng-template>
    <ng-template #other let-point><span class="other">other {{ point.key }}</span></ng-template>
  `,
})
class TestHostComponent {
  readonly full = viewChild.required<TemplateRef<PcacTooltipContext>>('full');
  readonly other = viewChild.required<TemplateRef<PcacTooltipContext>>('other');
  readonly label = signal('Sales');
}

function datum(key: string, value: number): PcacData {
  return { key, value, hide: false, data: [] };
}

function context(data: PcacData, parent: PcacData | null = null, isThreshold = false): PcacTooltipContext {
  return { $implicit: data, parent, isThreshold, index: 0, parentIndex: parent ? 0 : null, coincident: [] };
}

function mouse(pageX = 200, pageY = 300): MouseEvent {
  const event = new MouseEvent('mousemove');
  // jsdom's MouseEvent doesn't take page coordinates through its init dict.
  Object.defineProperty(event, 'pageX', { value: pageX });
  Object.defineProperty(event, 'pageY', { value: pageY });
  return event;
}

describe('PcacTooltipBuilder', () => {
  let builder: PcacTooltipBuilder;
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let shell: HTMLDivElement;

  beforeEach(() => {
    builder = TestBed.inject(PcacTooltipBuilder);
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    shell = builder.tooltip.node() as HTMLDivElement;
  });

  afterEach(() => {
    // The builder is a root singleton with one body-level element that outlives each TestBed
    // reset; leave it the way a fresh test expects to find it.
    builder.hideTooltip();
  });

  describe('default content (no template)', () => {
    it('renders the key and value with the default look applied to the shell', () => {
      builder.showTooltip(mouse(), undefined, context(datum('Jan', 42)));

      expect(shell.classList.contains('pcac-d3-tooltip')).toBe(true);
      expect(shell.classList.contains('pcac-d3-tooltip-default')).toBe(true);
      expect(shell.style.display).toBe('inline-block');
      expect(shell.innerHTML).toBe('Jan<br>42');
    });

    it('applies the value/key formats', () => {
      builder.showTooltip(mouse(), undefined, context(datum('Jan', 0.25)), PcacFormatEnum.Percentage);

      expect(shell.innerHTML).toBe('Jan<br>25%');
    });

    it('is what the deprecated showBarTooltip() renders', () => {
      builder.showBarTooltip(mouse(), datum('Feb', 7));

      expect(shell.classList.contains('pcac-d3-tooltip-default')).toBe(true);
      expect(shell.innerHTML).toBe('Feb<br>7');
    });
  });

  describe('with a template', () => {
    it('renders the template into the shell with the given context, and drops the default look', () => {
      builder.showTooltip(mouse(), host.full(), context(datum('jan', 42), datum('2024', 0)));

      expect(shell.classList.contains('pcac-d3-tooltip-default')).toBe(false);
      expect(shell.style.display).toBe('inline-block');
      expect(shell.querySelector('.custom')?.textContent).toBe('Sales: 2024 / JAN = 42');
    });

    it('exposes isThreshold', () => {
      builder.showTooltip(mouse(), host.full(), context(datum('limit', 100), null, true));

      expect(shell.querySelector('.custom')?.textContent).toBe('Sales:  / LIMIT = 100 (threshold)');
    });

    it('updates the existing view in place on a repeat show with the same template', () => {
      builder.showTooltip(mouse(), host.full(), context(datum('jan', 1)));
      const first = shell.querySelector('.custom');

      builder.showTooltip(mouse(), host.full(), context(datum('feb', 2)));

      expect(shell.querySelectorAll('.custom').length).toBe(1);
      expect(shell.querySelector('.custom')).toBe(first);
      expect(first?.textContent).toBe('Sales:  / FEB = 2');
    });

    it('swaps to a different template without leaving the previous one behind', () => {
      builder.showTooltip(mouse(), host.full(), context(datum('jan', 1)));
      builder.showTooltip(mouse(), host.other(), context(datum('jan', 1)));

      expect(shell.querySelector('.custom')).toBeNull();
      expect(shell.querySelector('.other')?.textContent).toBe('other jan');
    });

    it('goes back to the default content when a show comes in without a template', () => {
      builder.showTooltip(mouse(), host.full(), context(datum('jan', 1)));
      builder.showTooltip(mouse(), undefined, context(datum('Mar', 3)));

      expect(shell.querySelector('.custom')).toBeNull();
      expect(shell.classList.contains('pcac-d3-tooltip-default')).toBe(true);
      expect(shell.innerHTML).toBe('Mar<br>3');
    });

    it('keeps tracking the declaring component while shown (the view is attached to the app)', async () => {
      builder.showTooltip(mouse(), host.full(), context(datum('jan', 1)));

      host.label.set('Revenue');
      await fixture.whenStable();

      expect(shell.querySelector('.custom')?.textContent).toBe('Revenue:  / JAN = 1');
    });

    it('destroys the view and empties the shell on hide', () => {
      builder.showTooltip(mouse(), host.full(), context(datum('jan', 1)));
      builder.hideTooltip();

      expect(shell.style.display).toBe('none');
      expect(shell.innerHTML).toBe('');
    });

    it('rebuilds a fresh view for the next hover after a hide', () => {
      builder.showTooltip(mouse(), host.full(), context(datum('jan', 1)));
      const first = shell.querySelector('.custom');
      builder.hideTooltip();

      builder.showTooltip(mouse(), host.full(), context(datum('feb', 2)));

      const second = shell.querySelector('.custom');
      expect(second).not.toBe(first);
      expect(second?.textContent).toBe('Sales:  / FEB = 2');
    });
  });

  describe('positioning', () => {
    it('centers the rendered box horizontally on the cursor and sits it above, from measured size', () => {
      // jsdom does no layout, so the box's size is stubbed to make the arithmetic observable.
      Object.defineProperty(shell, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(shell, 'offsetHeight', { value: 40, configurable: true });

      builder.showTooltip(mouse(200, 300), host.full(), context(datum('jan', 1)));

      expect(shell.style.left).toBe('150px');
      expect(shell.style.top).toBe('252px');
    });
  });
});
