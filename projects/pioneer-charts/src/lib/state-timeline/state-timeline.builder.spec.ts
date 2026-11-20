import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PcacData } from '../core/chart.model';
import { StateTimelineBuilder } from './state-timeline.builder';
import { PcacStateTimelineConfig, PcacStateTimelineState } from './state-timeline.model';

/** Same technique as the other builders' specs: a laid-out parent with a width. */
function chartElm(width = 608): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

const STATES: PcacStateTimelineState[] = [
  { key: 'ok', label: 'OK' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' },
];

const period = (key: string, length: number | null, times: Record<string, number>, extra: Partial<PcacData> = {}): PcacData =>
  ({ key, value: length, hide: false, data: Object.entries(times).map(([state, time]) => ({ key: state, value: time, hide: false, data: [] })), ...extra });
const row = (key: string, periods: PcacData[], hide = false): PcacData => ({ key, value: null, hide, data: periods });

function config(data: PcacData[], extra: Partial<PcacStateTimelineConfig> = {}): PcacStateTimelineConfig {
  return { height: 20, states: STATES, data, rowLabels: false, ...extra };
}

function build(cfg: PcacStateTimelineConfig, width = 608): { builder: StateTimelineBuilder; svg: SVGSVGElement; elm: ElementRef } {
  const builder = TestBed.runInInjectionContext(() => new StateTimelineBuilder());
  const elm = chartElm(width);
  builder.buildChart(elm, cfg);
  return { builder, svg: elm.nativeElement, elm };
}

const periods = (svg: SVGSVGElement) => Array.from(svg.querySelectorAll<SVGGElement>('.pcac-state-period'));
const base = (g: Element) => g.querySelector('.pcac-state-fill')!;
const num = (el: Element, attr: string) => Number(el.getAttribute(attr));

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu'];

describe('StateTimelineBuilder', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('draws each period side by side across the width, the gap between them', () => {
    const { svg } = build(config([row('Disk', WEEK.map((day) => period(day, 24, { ok: 24 })))]));
    const rects = periods(svg).map(base);
    // 608px less a 4px margin each side, for the focus ring: 600px, less 3 gaps of 2px, over 4
    expect(rects.map((r) => num(r, 'width'))).toEqual([148.5, 148.5, 148.5, 148.5]);
    expect(rects.map((r) => num(r, 'x'))).toEqual([0, 150.5, 301, 451.5]);
    expect(rects.map((r) => num(r, 'height'))).toEqual([20, 20, 20, 20]);
  });

  it('narrows the gap as the periods narrow: 1px for 90 days in a card\'s column', () => {
    const days = Array.from({ length: 90 }, (_, i) => period(`Day ${i}`, 24, { ok: 24 }));
    const rects = periods(build(config([row('Disk', days)]), 265).svg).map(base);
    expect(num(rects[1], 'x') - num(rects[0], 'x') - num(rects[0], 'width')).toBeCloseTo(1);
  });

  it('colors each period by the worst state it was in, deeper the more of what is known that state took', () => {
    const { svg } = build(config([row('Disk', [
      period('Mon', 24, { ok: 24 }),
      period('Tue', 24, { ok: 18, warning: 6 }),
      period('Wed', 24, { ok: 12, error: 12 }),
      period('Thu', 24, {}),
    ])]));
    const [mon, tue, wed, thu] = periods(svg);
    expect(mon.classList).toContain('pcac-state-ok');
    expect(tue.classList).toContain('pcac-state-warning');
    expect(wed.classList).toContain('pcac-state-error');
    expect(thu.classList).toContain('pcac-state-unknown');
    expect(wed.style.getPropertyValue('--pcac-state-share')).toBe('0.5');
    expect(mon.style.getPropertyValue('--pcac-state-share')).toBe('1');
  });

  it('names the first state ok and the last error, with two states as with three', () => {
    const { svg } = build(config([row('Disk', [period('Mon', 2, { up: 1, down: 1 }), period('Tue', 2, { up: 2 })])],
      { states: [{ key: 'up' }, { key: 'down' }] }));
    expect(periods(svg).map((g) => g.classList.contains('pcac-state-error'))).toEqual([true, false]);
    expect(periods(svg)[1].classList).toContain('pcac-state-ok');
  });

  it('takes a state\'s color from the config, which wins over the theme\'s', () => {
    const { svg } = build(config([row('Disk', [period('Mon', 24, { error: 24 }), period('Tue', 24, { ok: 24 })])],
      { states: [{ key: 'ok' }, { key: 'error', color: 'purple' }] }));
    expect(periods(svg)[0].style.getPropertyValue('--pcac-state-color')).toBe('purple');
    expect(periods(svg)[1].style.getPropertyValue('--pcac-state-color')).toBe('');
  });

  it('stripes a period part of which is unknown, and only that one', () => {
    const { svg } = build(config([row('Disk', [period('Mon', 24, { ok: 12 }), period('Tue', 24, { ok: 24 }), period('Wed', 24, {})])]));
    expect(periods(svg).map((g) => !!g.querySelector('.pcac-state-stripes'))).toEqual([true, false, false]);
    const fill = periods(svg)[0].querySelector('.pcac-state-stripes')!.getAttribute('fill')!;
    const id = /url\(#(.+)\)/.exec(fill)![1];
    expect(svg.querySelector(`pattern#${id}`)).not.toBeNull();
  });

  it('gives each chart its own stripes, so two on a page don\'t share one pattern', () => {
    const first = build(config([row('Disk', [period('Mon', 24, { ok: 12 })])])).svg;
    const second = build(config([row('Disk', [period('Mon', 24, { ok: 12 })])])).svg;
    expect(first.querySelector('pattern')!.id).not.toBe(second.querySelector('pattern')!.id);
  });

  it('splits the height between the rows, 4px apart, leaving out a hidden row', () => {
    const { svg } = build(config([
      row('Camera 1', [period('Mon', 24, { ok: 24 })]),
      row('Hidden', [period('Mon', 24, { ok: 24 })], true),
      row('Camera 2', [period('Mon', 24, { ok: 24 })]),
    ], { height: 40 }));
    const rects = periods(svg).map(base);
    expect(rects.map((r) => [num(r, 'y'), num(r, 'height')])).toEqual([[0, 18], [22, 18]]);
  });

  it('labels each row to its left, making room for the longest, when rowLabels is on', () => {
    const { svg } = build(config([row('Camera 1', [period('Mon', 24, { ok: 24 })]), row('Camera 10', [period('Mon', 24, { ok: 24 })])],
      { rowLabels: true, height: 40 }));
    const labels = Array.from(svg.querySelectorAll('.pcac-state-row-label'));
    expect(labels.map((l) => l.textContent)).toEqual(['Camera 1', 'Camera 10']);
    // Hidden from screen readers: each period's name already says its row
    expect(labels.every((l) => l.closest('[aria-hidden="true"]'))).toBe(true);
    // The plot starts past the labels: narrower than with none
    expect(num(base(periods(svg)[0]), 'width')).toBeLessThan(600);
  });

  it('labels the rows unless told not to', () => {
    const { rowLabels: _, ...unset } = config([row('Disk', [period('Mon', 24, { ok: 24 })])]);
    expect(build(unset).svg.querySelector('.pcac-state-row-label')!.textContent).toBe('Disk');
  });

  it('draws no row labels when rowLabels is off', () => {
    expect(build(config([row('Disk', [period('Mon', 24, { ok: 24 })])])).svg.querySelector('.pcac-state-row-label')).toBeNull();
  });

  it('names each period for screen readers, its row first when it has a name', () => {
    const { svg } = build(config([
      row('Disk', [period('Mon', 24, { ok: 12, error: 12 })]),
      row('', [period('Tue', 24, {})]),
    ]));
    expect(periods(svg).map((g) => g.getAttribute('aria-label'))).toEqual(['Disk, Mon: Error 50%, OK 50%', 'Tue: unknown']);
    expect(periods(svg).every((g) => g.getAttribute('role') === 'img')).toBe(true);
    expect(svg.getAttribute('aria-label')).toBe('State timeline');
  });

  it('is one Tab stop', () => {
    const { svg } = build(config([row('Disk', WEEK.map((day) => period(day, 24, { ok: 24 })))]));
    expect(svg.querySelectorAll('[tabindex="0"]').length).toBe(1);
  });

  it('shows the period\'s name and summary in the default tooltip', () => {
    const { builder, svg } = build(config([row('Disk', [period('Mon', 24, { ok: 12, error: 12 })])]));
    const show = vi.spyOn(builder.tooltipBuilder, 'showTooltip');
    periods(svg)[0].dispatchEvent(new MouseEvent('mouseover'));
    const [, template, context] = show.mock.calls[0];
    expect(template).toBeUndefined();
    expect(context.$implicit).toEqual(expect.objectContaining({ key: 'Mon', value: 'Error 50%, OK 50%' }));
  });

  it('hands a tooltip template the period itself, its row and their places', () => {
    const { builder, svg } = build(config([
      row('Camera 1', [period('Mon', 24, { ok: 24 })]),
      row('Camera 2', [period('Mon', 24, { ok: 24 }), period('Tue', 24, { error: 24 })]),
    ]));
    const template = {} as never;
    builder.tooltipTemplate = () => template;
    const show = vi.spyOn(builder.tooltipBuilder, 'showTooltip').mockImplementation(() => undefined);
    periods(svg)[2].dispatchEvent(new MouseEvent('mouseover'));
    const [, given, context] = show.mock.calls[0];
    expect(given).toBe(template);
    expect(context.$implicit.key).toBe('Tue');
    expect(context.$implicit.value).toBe(24);
    expect(context.parent!.key).toBe('Camera 2');
    expect([context.index, context.parentIndex]).toEqual([1, 1]);
  });

  it('marks the hovered period, and lets it go', () => {
    const { svg } = build(config([row('Disk', [period('Mon', 24, { ok: 24 })])]));
    const [mon] = periods(svg);
    mon.dispatchEvent(new MouseEvent('mouseover'));
    expect(mon.classList).toContain('is-active');
    mon.dispatchEvent(new MouseEvent('mouseout'));
    expect(mon.classList).not.toContain('is-active');
  });

  it('passes a clicked period on', () => {
    const { builder, svg } = build(config([row('Disk', [period('Mon', 24, { ok: 24 })])]));
    const clicked: PcacData[] = [];
    builder.periodClicked$.subscribe((d) => clicked.push(d));
    periods(svg)[0].dispatchEvent(new MouseEvent('click'));
    expect(clicked.map((d) => d.key)).toEqual(['Mon']);
  });

  it('clears what it drew when given nothing to draw', () => {
    const { builder, svg, elm } = build(config([row('Disk', [period('Mon', 24, { ok: 24 })])]));
    builder.buildChart(elm, config([]));
    expect(periods(svg)).toEqual([]);
  });

  it('draws nothing, not even a row\'s label, when every period is hidden', () => {
    const { svg } = build(config([row('Disk', [period('Mon', 24, { ok: 24 }, { hide: true })])], { rowLabels: true }));
    expect(svg.querySelector('.pcac-state-row-label')).toBeNull();
  });
});
