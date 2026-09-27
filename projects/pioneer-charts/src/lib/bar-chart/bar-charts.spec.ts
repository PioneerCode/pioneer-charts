import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BarVerticalChartBuilder } from './bar-vertical-chart/bar-vertical-chart.builder';
import { BarHorizontalChartBuilder } from './bar-horizontal-chart/bar-horizontal-chart.builder';
import { PcacBarVerticalChartConfig } from './bar-vertical-chart/bar-vertical-chart.model';
import { PcacBarHorizontalChartConfig } from './bar-horizontal-chart/bar-horizontal-chart.model';
import { PcacData } from '../core/chart.model';

/**
 * Behavior both bar charts share, run against each. Same technique as the builders' own specs: a
 * real jsdom `<svg>` with a stubbed parent `clientWidth`.
 */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

const bar = (key: string, value: number): PcacData => ({ key, value, hide: false, data: [] });
const group = (key: string, bars: PcacData[]): PcacData => ({ key, value: null, hide: false, data: bars });
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Builder = BarVerticalChartBuilder | BarHorizontalChartBuilder;
type Config = PcacBarVerticalChartConfig & PcacBarHorizontalChartConfig;

const charts = [
  {
    name: 'BarVerticalChartBuilder',
    create: () => new BarVerticalChartBuilder() as Builder,
    // The attributes the bar's position within its group, and its grown size, are drawn with.
    offset: 'x',
    size: 'height',
    thickness: 'width',
  },
  {
    name: 'BarHorizontalChartBuilder',
    create: () => new BarHorizontalChartBuilder() as Builder,
    offset: 'y',
    size: 'width',
    thickness: 'height',
  },
] as const;

for (const chart of charts) {
  describe(`${chart.name} (shared bar behavior)`, () => {
    let builder: Builder;

    // bar-horizontal-chart sizes its left margin from the axis labels' getBBox(), which jsdom lacks.
    beforeAll(() => {
      (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () =>
        ({ x: 0, y: 0, width: 40, height: 12 }) as DOMRect;
    });

    afterAll(() => {
      delete (SVGElement.prototype as unknown as { getBBox?: () => DOMRect }).getBBox;
    });

    beforeEach(() => {
      builder = TestBed.runInInjectionContext(chart.create);
    });

    afterEach(() => vi.restoreAllMocks());

    function config(data: PcacData[], overrides: Partial<Config> = {}): Config {
      return {
        ...new PcacBarVerticalChartConfig(),
        height: 200,
        xAxis: { domainMax: 100 },
        yAxis: { domainMax: 100 },
        data,
        ...overrides,
      } as Config;
    }

    function build(cfg: Config, width?: number): SVGSVGElement {
      const elm = chartElm(width);
      builder.buildChart(elm, cfg);
      return elm.nativeElement;
    }

    const bars = (svg: SVGSVGElement) => Array.from(svg.querySelectorAll<SVGRectElement>('.pcac-bar'));

    // Regression test: the hover fade ran as an unnamed transition on the bar - the same name as
    // the enter transition growing it - so hovering a bar while it grew cancelled the growth and
    // left it part-grown until the next rebuild. Runs the real (shortened) transitions.
    it('still grows a bar that is hovered mid-growth', async () => {
      const duration = 200;
      vi.spyOn(builder.transitionService, 'getTransitionDuration').mockReturnValue(duration);
      const svg = build(config([group('A', [bar('a', 100)])]));
      const rect = bars(svg)[0];

      await wait(duration / 4);
      rect.dispatchEvent(new MouseEvent('mouseover'));
      await wait(duration * 2);

      const full = chart.size === 'height' ? builder.height : builder.width;
      expect(Number(rect.getAttribute(chart.size))).toBeCloseTo(full, 0);
    });

    // Regression test: the horizontal chart JSON-cloned its config, so `barClicked` handed back a
    // copy of the clicked bar rather than the consumer's own object.
    it('emits the consumer\'s own PcacData on click', () => {
      const clicked = bar('a', 10);
      const svg = build(config([group('A', [clicked])]));
      const emitted = vi.fn();
      const subscription = builder.barClicked$.subscribe(emitted);

      bars(svg)[0].dispatchEvent(new MouseEvent('click'));

      expect(emitted).toHaveBeenCalledWith(clicked);
      expect(emitted.mock.calls[0][0]).toBe(clicked);
      subscription.unsubscribe();
    });

    // Regression test: a stacked bar was offset within its group by looking its *series* key up in
    // the *group* band, which normally missed (0) - but a series key equal to a group key put the
    // bar in that group's slot, on top of its own group's offset.
    it('keeps stacked bars in their own group when series keys match group keys', () => {
      const svg = build(config([group('A', [bar('A', 10)]), group('B', [bar('B', 10)])], { isStacked: true }));

      expect(bars(svg).map((r) => r.getAttribute(chart.offset))).toEqual(['0', '0']);
    });

    // Regression test: bars took their color from their position within their own group, while
    // their slot came from their series - so a group missing a series colored the rest wrong.
    it('colors a bar by its series across groups that hold different series', () => {
      const svg = build(config([
        group('A', [bar('a', 10), bar('b', 10)]),
        group('B', [bar('b', 10)]),
      ]));

      const [aInA, bInA, bInB] = bars(svg).map((r) => r.style.fill);
      expect(bInB).toBe(bInA);
      expect(bInB).not.toBe(aInA);
    });

    it('colors every series distinctly when no one group holds them all', () => {
      const svg = build(config([
        group('A', [bar('a', 10)]),
        group('B', [bar('b', 10)]),
      ]));

      const [a, b] = bars(svg).map((r) => r.style.fill);
      expect(a).toBeTruthy();
      expect(b).toBeTruthy();
      expect(a).not.toBe(b);
    });

    // Regression test: coloring by series key painted every bar that shares a key the same
    // color - and `PcacData.key` defaults to null, so a stack built without keys came out as one
    // solid color. Keys that can't tell series apart fall back to coloring by position.
    it('colors a stack whose segments have no keys by position', () => {
      const keyless = (value: number): PcacData => ({ key: null, value, hide: false, data: [] });
      const svg = build(config([group('A', [keyless(10), keyless(20), keyless(30)])], { isStacked: true }));

      expect(new Set(bars(svg).map((r) => r.style.fill)).size).toBe(3);
    });

    it('colors bars that repeat a key within their group by position', () => {
      const svg = build(config([group('A', [bar('x', 10), bar('x', 20)])], { isStacked: true }));

      const [first, second] = bars(svg).map((r) => r.style.fill);
      expect(first).not.toBe(second);
    });

    it('puts a bar back to its own color when the pointer leaves it', async () => {
      const duration = 40;
      vi.spyOn(builder.transitionService, 'getTransitionDuration').mockReturnValue(duration);
      const svg = build(config([group('A', [bar('a', 10), bar('b', 10)])]));
      const rect = bars(svg)[1];
      const resting = rect.style.fill;

      rect.dispatchEvent(new MouseEvent('mouseover'));
      await wait(duration);
      expect(rect.style.fill).not.toBe(resting);
      rect.dispatchEvent(new MouseEvent('mouseout'));
      await wait(duration * 2);

      expect(rect.style.fill).toBe(resting);
    });

    // Regression test: rounding the category band to whole pixels floors its step, so with more
    // categories than pixels every band - and so every bar - collapsed to 0 and nothing drew.
    it('still draws bars when there are more categories than pixels', async () => {
      // The vertical chart sets a bar's width as part of its enter transition.
      vi.spyOn(builder.transitionService, 'getTransitionDuration').mockReturnValue(0);
      // A 200px-square chart, so a few hundred categories already outnumber the pixels on either
      // chart's category axis: each group is a full axis tick and bar to draw, and a thousand of
      // them took over 5s on a CI runner.
      const groups = Array.from({ length: 400 }, (_, i) => group(`g${i}`, [bar('a', 10)]));
      const svg = build(config(groups), 200);
      const plot = chart.size === 'height' ? builder.width : builder.height;
      expect(groups.length).toBeGreaterThan(plot);
      await wait(50);

      expect(Number(bars(svg)[0].getAttribute(chart.thickness))).toBeGreaterThan(0);
    });

    // Regression test: bars were placed by series key, so bars with no key (PcacData's default) or
    // a repeated one all landed in one slot, drawn over each other with only the last visible.
    it('gives bars without distinct series keys a slot each', () => {
      const svg = build(config([group('A', [bar(null as unknown as string, 10), bar(null as unknown as string, 20)])]));

      const offsets = bars(svg).map((b) => b.getAttribute(chart.offset));
      expect(new Set(offsets).size).toBe(2);
    });

    describe('keyboard and screen readers', () => {
      const data = () => [
        group('Chips', [bar('2023', 10), bar('2024', 20)]),
        group('Gum', [bar('2023', 30), { ...bar('2024', 40), hide: true }]),
      ];
      const key = (target: Element, name: string) =>
        target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
      const tooltip = () => document.querySelector<HTMLElement>('.pcac-d3-tooltip');

      it('names each bar by its group, its key and its value', () => {
        const svg = build(config(data()));

        expect(bars(svg).slice(0, 3).map((b) => b.getAttribute('aria-label')))
          .toEqual(['Chips, 2023: 10', 'Chips, 2024: 20', 'Gum, 2023: 30']);
        expect(bars(svg)[0].getAttribute('role')).toBe('img');
      });

      it('is one Tab stop, and leaves a hidden bar out', () => {
        const svg = build(config(data()));

        expect(bars(svg).map((b) => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', null]);
        expect(bars(svg)[3].getAttribute('aria-hidden')).toBe('true');
      });

      it('emits barClicked for Enter on a bar', () => {
        const groups = data();
        const svg = build(config(groups));
        const clicked: PcacData[] = [];
        builder.barClicked$.subscribe((d) => clicked.push(d));

        key(bars(svg)[1], 'Enter');

        // The consumer's own datum, as a click emits.
        expect(clicked).toHaveLength(1);
        expect(clicked[0]).toBe(groups[0].data[1]);
      });

      it('shows the tooltip on focus and hides it on blur', () => {
        const svg = build(config(data()));
        const first = bars(svg)[0];

        first.focus();
        expect(tooltip()?.style.display).toBe('inline-block');
        expect(tooltip()?.textContent).toContain('10');

        first.blur();
        expect(tooltip()?.style.display).toBe('none');
      });

      // Regression test: every redraw replaced the marks, so a keyboard user whose Enter updated the
      // data - or who was on a chart that resized, or took live data - was dropped at the top of
      // the page, and the Tab stop went back to the first bar.
      it('keeps focus, and the Tab stop, on the same bar through a redraw', () => {
        const svg = build(config(data()));
        bars(svg)[0].focus();
        key(bars(svg)[0], 'ArrowRight');

        builder.buildChart({ nativeElement: svg } as ElementRef, config(data()));

        expect(document.activeElement).toBe(bars(svg)[1]);
        expect(bars(svg).map((b) => b.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', null]);
      });

      it('keeps the Tab stop without taking focus when the chart didn\'t have it', () => {
        const svg = build(config(data()));
        bars(svg)[0].focus();
        key(bars(svg)[0], 'ArrowRight');
        bars(svg)[1].blur();

        builder.buildChart({ nativeElement: svg } as ElementRef, config(data()));

        expect(document.activeElement).not.toBe(bars(svg)[1]);
        expect(bars(svg)[1].getAttribute('tabindex')).toBe('0');
      });

      it('moves to the last bar when the one it was on is gone', () => {
        const svg = build(config(data()));
        bars(svg)[0].focus();
        key(bars(svg)[0], 'End');

        builder.buildChart({ nativeElement: svg } as ElementRef, config([group('Chips', [bar('2023', 10)])]));

        expect(document.activeElement).toBe(bars(svg)[0]);
      });

      it('moves between bars across groups with the arrow keys', () => {
        const svg = build(config(data()));
        bars(svg)[0].focus();

        key(bars(svg)[0], 'ArrowRight');
        key(bars(svg)[1], 'ArrowRight');

        expect(document.activeElement).toBe(bars(svg)[2]);
        expect(tooltip()?.textContent).toContain('30');
      });
    });
  });
}
