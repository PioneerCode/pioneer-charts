import { Selection } from 'd3-selection';

/** Marks the elements `makeMarksAccessible` set up, so navigation can find a chart's marks. */
const MARK_ATTR = 'data-pcac-mark';

/**
 * How a chart's marks - its bars, slices or points - take part in keyboard and screen reader use.
 * See `makeMarksAccessible`.
 */
export interface PcacMarkAccess<E extends Element, D> {
  /** The mark's accessible name, e.g. `"Chips, 2024: 680"`. */
  label: (d: D, element: E) => string;
  /** Leaves a mark out of navigation and the accessibility tree: a hidden bar, series or slice. */
  skip?: (d: D) => boolean;
  /** Enter or Space on a mark: what a click does. */
  activate: (d: D) => void;
  /** Keyboard focus arrived on a mark: what hovering it does - highlight it and show its tooltip. */
  focus: (element: E, d: D) => void;
  /** Keyboard focus left a mark, or Escape was pressed on it: what the pointer leaving does. */
  blur: (element: E, d: D) => void;
}

/**
 * Makes a chart's marks usable from the keyboard and readable by a screen reader, alongside the
 * pointer handlers they already have.
 *
 * Every mark gets a role and a name, but only one of them - the chart's "tab stop" - is in the Tab
 * order (see `refreshTabStop`): Tab reaches the chart once, and the arrow keys move between its
 * marks, Home and End to the first and last. A chart of a thousand bars isn't a thousand Tab
 * presses to get past. Focus does what hovering does (`focus`), and Enter or Space what a click
 * does (`activate`); Escape hides the tooltip, as moving the pointer away would - and goes no
 * further while it has one to hide, so it doesn't also close a dialog the chart is in. Keys pressed
 * with Alt, Ctrl or Cmd are left to the browser (Alt+Left is Back).
 *
 * A mark takes focus from the keyboard only: pressing the pointer on one is kept from focusing it,
 * so a click doesn't leave a keyboard-style tooltip and focus ring behind on the clicked mark. It
 * does let go of a mark in the same chart that has focus, which would otherwise stay highlighted,
 * its tooltip gone, while the pointer is at work elsewhere in the chart.
 */
export function makeMarksAccessible<E extends Element, D>(
  marks: Selection<E, D, any, any>,
  access: PcacMarkAccess<E, D>,
): void {
  const skipped = (d: D) => access.skip?.(d) ?? false;
  // The marks showing what focus shows (their tooltip, highlighted), until blur or Escape.
  const open = new WeakSet<Element>();
  marks
    .attr(MARK_ATTR, (d: D) => (skipped(d) ? null : ''))
    .attr('aria-hidden', (d: D) => (skipped(d) ? 'true' : null))
    // An image, with a name, rather than a button: whether the chart's click output has a listener
    // can't be told from here (the pie, donut, line, area and plot charts' own wrappers always
    // listen, to pass it on), and a button that does nothing would be a lie. Enter and Space still
    // do what a click does, and the click listener has browsers report the mark as clickable.
    .attr('role', (d: D) => (skipped(d) ? null : 'img'))
    .attr('aria-label', function (this: E, d: D) {
      return skipped(d) ? null : access.label(d, this);
    })
    .attr('tabindex', (d: D) => (skipped(d) ? null : -1))
    // The events are typed plainly as `Event`: with the element type generic here, d3's typings
    // (@types/d3-selection 3.0.12 on) can't narrow them to `MouseEvent`/`KeyboardEvent`.
    .on('mousedown.pcac-mark', function (this: E, event: Event) {
      event.preventDefault();
      const focused = this.ownerDocument.activeElement;
      if (focused !== this && focused?.hasAttribute(MARK_ATTR) && sameChart(focused, this)) {
        (focused as SVGElement).blur();
      }
    })
    .on('focus.pcac-mark', function (this: E, _event: Event, d: D) {
      open.add(this);
      access.focus(this, d);
    })
    .on('blur.pcac-mark', function (this: E, _event: Event, d: D) {
      open.delete(this);
      access.blur(this, d);
    })
    .on('keydown.pcac-mark', function (this: E, event: Event, d: D) {
      const { key, altKey, ctrlKey, metaKey } = event as KeyboardEvent;
      if (altKey || ctrlKey || metaKey) {
        return;
      }
      switch (key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          access.activate(d);
          return;
        case 'Escape':
          // Only while there's a tooltip to hide; a second Escape carries on to whatever the
          // chart is in (a dialog closes, as it would have).
          if (open.delete(this)) {
            event.preventDefault();
            event.stopPropagation();
            access.blur(this, d);
          }
          return;
      }
      const target = neighbor(this, key);
      if (target) {
        event.preventDefault();
        moveFocus(this, target);
      }
    });
}

/** Where a chart's Tab stop was, and whether it had focus: what a redraw puts back. */
export interface PcacMarkFocus {
  /** The Tab stop's place among the marks that could take focus. */
  index: number;
  focused: boolean;
}

/**
 * Notes the chart's Tab stop - and whether it has focus - before a redraw removes every mark, so
 * `refreshTabStop` can put both back: a keyboard user who pressed Enter on a bar, with a click
 * handler that updates the data, stays on that bar rather than being dropped at the top of the
 * page. `null` when the chart has no Tab stop.
 */
export function captureMarkFocus(root: Element | null): PcacMarkFocus | null {
  if (!root) {
    return null;
  }
  const marks = navigableMarks(root);
  const index = marks.findIndex((mark) => mark.getAttribute('tabindex') === '0');
  if (index < 0) {
    return null;
  }
  return { index, focused: root.ownerDocument.activeElement === marks[index] };
}

/**
 * Puts the chart's one Tab stop (`tabindex="0"`) on a mark that can take focus; every other mark
 * is `-1` already (`makeMarksAccessible`). Call once a chart's marks are drawn, and again whenever
 * marks can have been hidden - by zoom, say - so Tab doesn't land on one that can't be focused and
 * skip the chart.
 *
 * Leaves the Tab stop where it is while that mark can still take focus, so coming back to the chart
 * returns to the mark last visited. After a redraw, given what `captureMarkFocus` noted, it goes
 * back to the same place - the last mark, if there are fewer now - and takes focus back if it had
 * it. Touches only the old and new stops, as it runs on every zoom frame.
 */
export function refreshTabStop(root: Element | null, previous: PcacMarkFocus | null = null): void {
  if (!root) {
    return;
  }
  const current = root.querySelector(`[${MARK_ATTR}][tabindex="0"]`);
  if (current && !previous && !isNotDisplayed(current, root)) {
    return;
  }
  const marks = navigableMarks(root);
  const stop = previous ? marks[Math.min(previous.index, marks.length - 1)] : marks[0];
  if (current && current !== stop) {
    current.setAttribute('tabindex', '-1');
  }
  if (!stop) {
    return;
  }
  stop.setAttribute('tabindex', '0');
  if (previous?.focused) {
    (stop as SVGElement).focus({ preventScroll: true });
  }
}

/** Whether two marks are in the same chart (the same `<svg>`). */
function sameChart(a: Element, b: Element): boolean {
  return ((a as SVGElement).ownerSVGElement ?? a.parentElement) === ((b as SVGElement).ownerSVGElement ?? b.parentElement);
}

/** The chart's marks that can take focus now, in drawing order. */
function navigableMarks(root: Element): Element[] {
  return Array.from(root.querySelectorAll(`[${MARK_ATTR}]`)).filter((mark) => !isNotDisplayed(mark, root));
}

/**
 * Whether the mark, or a group it's in, isn't displayed: a hidden series, or a point zoomed out of
 * the plot. Read from the `display` attribute and inline style the builders set, rather than from
 * layout, which a browser without one (a test environment) doesn't have.
 */
function isNotDisplayed(mark: Element, root: Element): boolean {
  for (let node: Element | null = mark; node && node !== root; node = node.parentElement) {
    if (node.getAttribute('display') === 'none' || (node as SVGElement).style?.display === 'none') {
      return true;
    }
  }
  return false;
}

/** The mark an arrow, Home or End key moves to from `mark`, or `null` for any other key. */
function neighbor(mark: Element, key: string): Element | null {
  const root = (mark as SVGElement).ownerSVGElement ?? mark.parentElement;
  if (!root) {
    return null;
  }
  const marks = navigableMarks(root);
  const at = marks.indexOf(mark);
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return marks[Math.min(at + 1, marks.length - 1)] ?? null;
    case 'ArrowLeft':
    case 'ArrowUp':
      return marks[Math.max(at - 1, 0)] ?? null;
    case 'Home':
      return marks[0] ?? null;
    case 'End':
      return marks[marks.length - 1] ?? null;
    default:
      return null;
  }
}

/** Moves focus, and the chart's Tab stop with it, from one mark to another. */
function moveFocus(from: Element, to: Element): void {
  if (from === to) {
    return;
  }
  from.setAttribute('tabindex', '-1');
  to.setAttribute('tabindex', '0');
  (to as SVGElement).focus();
}

