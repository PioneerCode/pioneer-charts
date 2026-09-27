import { select } from 'd3-selection';
import { vi } from 'vitest';
import { captureMarkFocus, makeMarksAccessible, refreshTabStop } from './marks';

interface Datum { key: string; hide?: boolean }

/** An `<svg>` in the document with one `<rect>` per datum, made accessible with spied callbacks. */
function setUp(data: Datum[]) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  const access = {
    label: vi.fn((d: Datum) => `Mark ${d.key}`),
    skip: (d: Datum) => !!d.hide,
    activate: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
  };
  const marks = select(svg).selectAll('rect').data(data).enter().append('rect');
  makeMarksAccessible(marks, access);
  refreshTabStop(svg);
  const rects = Array.from(svg.querySelectorAll('rect'));
  return { svg, access, rects };
}

const key = (target: Element, name: string, modifiers: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...modifiers });
  target.dispatchEvent(event);
  return event;
};

describe('makeMarksAccessible', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('names each mark and announces it as an image', () => {
    const { rects } = setUp([{ key: 'a' }, { key: 'b' }]);

    expect(rects.map((r) => r.getAttribute('aria-label'))).toEqual(['Mark a', 'Mark b']);
    expect(rects.map((r) => r.getAttribute('role'))).toEqual(['img', 'img']);
  });

  it('puts only the first mark in the Tab order', () => {
    const { rects } = setUp([{ key: 'a' }, { key: 'b' }, { key: 'c' }]);

    expect(rects.map((r) => r.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('leaves a skipped mark out of navigation and the accessibility tree', () => {
    const { rects } = setUp([{ key: 'a', hide: true }, { key: 'b' }]);

    expect(rects[0].getAttribute('aria-hidden')).toBe('true');
    expect(rects[0].hasAttribute('tabindex')).toBe(false);
    expect(rects[0].hasAttribute('role')).toBe(false);
    expect(rects[1].getAttribute('tabindex')).toBe('0');
  });

  it('moves focus, and the Tab stop, with the arrow keys, Home and End', () => {
    const { rects } = setUp([{ key: 'a' }, { key: 'b' }, { key: 'c' }]);
    rects[0].focus();

    key(rects[0], 'ArrowRight');
    expect(document.activeElement).toBe(rects[1]);
    expect(rects.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

    key(rects[1], 'End');
    expect(document.activeElement).toBe(rects[2]);
    key(rects[2], 'ArrowDown');
    expect(document.activeElement).toBe(rects[2]);

    key(rects[2], 'ArrowLeft');
    expect(document.activeElement).toBe(rects[1]);
    key(rects[1], 'Home');
    expect(document.activeElement).toBe(rects[0]);
    key(rects[0], 'ArrowUp');
    expect(document.activeElement).toBe(rects[0]);
  });

  it('skips marks that are not displayed when moving', () => {
    const { rects } = setUp([{ key: 'a' }, { key: 'b' }, { key: 'c' }]);
    rects[1].setAttribute('display', 'none');
    rects[0].focus();

    key(rects[0], 'ArrowRight');

    expect(document.activeElement).toBe(rects[2]);
  });

  it('does what a click does on Enter and Space', () => {
    const { rects, access } = setUp([{ key: 'a' }]);

    key(rects[0], 'Enter');
    const space = key(rects[0], ' ');

    expect(access.activate).toHaveBeenCalledTimes(2);
    expect(access.activate).toHaveBeenCalledWith({ key: 'a' });
    // Or the page would scroll.
    expect(space.defaultPrevented).toBe(true);
  });

  it('does what hovering does on focus, and undoes it on blur and on Escape', () => {
    const { rects, access } = setUp([{ key: 'a' }, { key: 'b' }]);

    rects[0].focus();
    expect(access.focus).toHaveBeenCalledWith(rects[0], { key: 'a' });

    key(rects[0], 'Escape');
    expect(access.blur).toHaveBeenCalledTimes(1);

    rects[0].blur();
    expect(access.blur).toHaveBeenCalledTimes(2);
  });

  // Regression test: Escape bubbled on, so in a dialog it closed the whole dialog along with the
  // tooltip it was meant to hide.
  it('keeps an Escape that hides a tooltip to itself, and lets the next one through', () => {
    const { svg, rects, access } = setUp([{ key: 'a' }]);
    const outside = vi.fn();
    svg.addEventListener('keydown', outside);
    rects[0].focus();

    const first = key(rects[0], 'Escape');
    const second = key(rects[0], 'Escape');

    expect(first.defaultPrevented).toBe(true);
    expect(access.blur).toHaveBeenCalledTimes(1);
    expect(outside).toHaveBeenCalledTimes(1);
    expect(second.defaultPrevented).toBe(false);
  });

  it('leaves keys pressed with Alt, Ctrl or Cmd to the browser', () => {
    const { rects, access } = setUp([{ key: 'a' }, { key: 'b' }]);
    rects[0].focus();

    const back = key(rects[0], 'ArrowLeft', { altKey: true });
    key(rects[0], 'ArrowRight', { metaKey: true });
    key(rects[0], 'Enter', { ctrlKey: true });

    expect(back.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(rects[0]);
    expect(access.activate).not.toHaveBeenCalled();
  });

  it('leaves other keys to the page', () => {
    const { rects } = setUp([{ key: 'a' }, { key: 'b' }]);

    expect(key(rects[0], 'Tab').defaultPrevented).toBe(false);
  });

  it('keeps the pointer from focusing a mark', () => {
    const { rects } = setUp([{ key: 'a' }]);
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    rects[0].dispatchEvent(press);

    expect(press.defaultPrevented).toBe(true);
  });
});

describe('refreshTabStop', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps the Tab stop on the mark last visited', () => {
    const { svg, rects } = setUp([{ key: 'a' }, { key: 'b' }]);
    rects[0].focus();
    key(rects[0], 'ArrowRight');

    refreshTabStop(svg);

    expect(rects.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0']);
  });

  it('moves the Tab stop off a mark that is no longer displayed', () => {
    const { svg, rects } = setUp([{ key: 'a' }, { key: 'b' }]);
    rects[0].setAttribute('display', 'none');

    refreshTabStop(svg);

    expect(rects.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0']);
  });
});

describe('captureMarkFocus / refreshTabStop across a redraw', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /** Replaces the marks with a fresh set, as a chart's redraw does. */
  function redraw(svg: SVGSVGElement, data: Datum[]) {
    svg.innerHTML = '';
    const access = { label: (d: Datum) => d.key, activate: vi.fn(), focus: vi.fn(), blur: vi.fn() };
    makeMarksAccessible(select(svg).selectAll('rect').data(data).enter().append('rect'), access);
    return Array.from(svg.querySelectorAll('rect'));
  }

  it('puts the Tab stop back where it was, and focus with it', () => {
    const { svg, rects } = setUp([{ key: 'a' }, { key: 'b' }, { key: 'c' }]);
    rects[0].focus();
    key(rects[0], 'ArrowRight');

    const noted = captureMarkFocus(svg);
    const fresh = redraw(svg, [{ key: 'a' }, { key: 'b' }, { key: 'c' }]);
    refreshTabStop(svg, noted);

    expect(noted).toEqual({ index: 1, focused: true });
    expect(fresh.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    expect(document.activeElement).toBe(fresh[1]);
  });

  it('notes nothing for a chart with no marks', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    expect(captureMarkFocus(svg)).toBeNull();
  });
});
