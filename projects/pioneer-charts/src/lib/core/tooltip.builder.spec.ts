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

    it('shows a Percentage fraction without floating-point noise, and a missing value blank', () => {
      builder.showTooltip(mouse(), undefined, context(datum('Jan', 0.07)), PcacFormatEnum.Percentage);
      expect(shell.innerHTML).toBe('Jan<br>7%');

      builder.showTooltip(mouse(), undefined, context({ key: 'Feb', value: null, hide: false, data: [] }), PcacFormatEnum.Percentage);
      expect(shell.innerHTML).toBe('Feb<br>');
    });

    it('shows markup in the key and value as text rather than rendering it', () => {
      builder.showTooltip(mouse(), undefined, context({
        key: '<img src=x onerror="window.pwned=1">', value: '<b>42</b>', hide: false, data: [],
      }));

      expect(shell.querySelector('img')).toBeNull();
      expect(shell.querySelector('b')).toBeNull();
      expect(shell.textContent).toBe('<img src=x onerror="window.pwned=1"><b>42</b>');
    });

    it('keeps a key of 0 and shows a missing value as blank', () => {
      builder.showTooltip(mouse(), undefined, context({ key: 0, value: null, hide: false, data: [] }));

      expect(shell.innerHTML).toBe('0<br>');
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

    describe('beside an anchor', () => {
      const root = document.documentElement;

      // A 1000x800 viewport and a 100x40 tooltip; each test places a 20x20 anchor somewhere in it.
      beforeEach(() => {
        Object.defineProperty(root, 'clientWidth', { value: 1000, configurable: true });
        Object.defineProperty(root, 'clientHeight', { value: 800, configurable: true });
        Object.defineProperty(shell, 'offsetWidth', { value: 100, configurable: true });
        Object.defineProperty(shell, 'offsetHeight', { value: 40, configurable: true });
      });

      afterEach(() => {
        delete (root as any).clientWidth;
        delete (root as any).clientHeight;
        delete (shell as any).offsetWidth;
        delete (shell as any).offsetHeight;
      });

      function anchorAt(left: number, top: number, size = 20): Element {
        const anchor = document.createElement('div');
        anchor.getBoundingClientRect = () =>
          ({ left, top, right: left + size, bottom: top + size, width: size, height: size }) as DOMRect;
        return anchor;
      }

      function showBeside(anchor: Element): void {
        // The cursor is deliberately far from the anchor: with one, only the anchor matters.
        builder.showTooltip(mouse(0, 0), host.full(), context(datum('jan', 1)), undefined, undefined, anchor);
      }

      it('puts its bottom-left corner at the anchor\'s top-right by default', () => {
        showBeside(anchorAt(100, 300));

        expect(shell.style.left).toBe('128px'); // 120 + gap
        expect(shell.style.top).toBe('252px'); // 300 - gap - 40
      });

      it('flips to the left when it would run off the right of the viewport', () => {
        showBeside(anchorAt(900, 300)); // 1000 - 920 - gap = 72 < 100

        expect(shell.style.left).toBe('792px'); // 900 - gap - 100
        expect(shell.style.top).toBe('252px');
      });

      it('flips below when it would run off the top of the viewport', () => {
        showBeside(anchorAt(100, 30)); // 30 - gap = 22 < 40

        expect(shell.style.left).toBe('128px');
        expect(shell.style.top).toBe('58px'); // 50 + gap
      });

      it('flips both ways at a top-right corner', () => {
        showBeside(anchorAt(900, 30));

        expect(shell.style.left).toBe('792px');
        expect(shell.style.top).toBe('58px');
      });

      it('takes the side with more room when neither side fits', () => {
        Object.defineProperty(shell, 'offsetWidth', { value: 600, configurable: true });

        showBeside(anchorAt(300, 300)); // 672 on the right: fits, so no flip
        expect(shell.style.left).toBe('328px');

        showBeside(anchorAt(500, 300)); // 472 right vs 492 left: neither fits, left is roomier
        expect(shell.style.left).toBe('-108px'); // 500 - gap - 600

        showBeside(anchorAt(480, 300)); // 492 right vs 472 left: neither fits, right is roomier
        expect(shell.style.left).toBe('508px');
      });

      it('offsets by the page scroll, since the anchor\'s box is viewport-relative', () => {
        vi.spyOn(window, 'scrollX', 'get').mockReturnValue(15);
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(400);

        showBeside(anchorAt(100, 300));

        expect(shell.style.left).toBe('143px');
        expect(shell.style.top).toBe('652px');
        vi.restoreAllMocks();
      });
    });
  });

  describe('owner', () => {
    const a = {};
    const b = {};
    const show = (owner?: object) =>
      builder.showTooltip(mouse(), undefined, context(datum('Jan', 1)), undefined, undefined, undefined, owner);

    it('is only hidden by the owner showing it', () => {
      show(a);
      builder.hideTooltip(b);
      expect(shell.style.display).toBe('inline-block');

      builder.hideTooltip(a);
      expect(shell.style.display).toBe('none');
    });

    it('is always hidden when no owner is given', () => {
      show(a);
      builder.hideTooltip();
      expect(shell.style.display).toBe('none');
    });

    it('belongs to whoever showed it last', () => {
      show(a);
      show(b);
      builder.hideTooltip(a);
      expect(shell.style.display).toBe('inline-block');
    });
  });

  describe('shell lifecycle', () => {
    it('touches the page only once a tooltip is first shown', () => {
      const count = () => document.querySelectorAll('.pcac-d3-tooltip').length;
      const before = count();

      const fresh = TestBed.runInInjectionContext(() => new PcacTooltipBuilder());
      fresh.hideTooltip();
      expect(count()).toBe(before);

      fresh.showTooltip(mouse(), undefined, context(datum('Jan', 1)));
      expect(count()).toBe(before + 1);
      fresh.ngOnDestroy();
      expect(count()).toBe(before);
    });

    it('is removed from the page when the app is torn down, and recreated on next use', () => {
      builder.showTooltip(mouse(), undefined, context(datum('Jan', 1)));
      expect(document.body.contains(shell)).toBe(true);

      builder.ngOnDestroy();
      expect(document.body.contains(shell)).toBe(false);

      const recreated = builder.tooltip.node() as HTMLDivElement;
      expect(recreated).not.toBe(shell);
      expect(document.body.contains(recreated)).toBe(true);
    });
  });
});
