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
 * does (`activate`); Escape hides the tooltip, as moving the pointer away would.
 *
 * A mark takes focus from the keyboard only: pressing the pointer on one is kept from focusing it,
 * so a click doesn't leave a keyboard-style tooltip and focus ring behind on the clicked mark.
 */
export function makeMarksAccessible<E extends Element, D>(
  marks: Selection<E, D, any, any>,
  access: PcacMarkAccess<E, D>,
): void {
  const skipped = (d: D) => access.skip?.(d) ?? false;
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
    .on('mousedown.pcac-mark', (event: Event) => event.preventDefault())
    .on('focus.pcac-mark', function (this: E, _event: Event, d: D) {
      access.focus(this, d);
    })
    .on('blur.pcac-mark', function (this: E, _event: Event, d: D) {
      access.blur(this, d);
    })
    .on('keydown.pcac-mark', function (this: E, event: Event, d: D) {
      const { key } = event as KeyboardEvent;
      switch (key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          access.activate(d);
          return;
        case 'Escape':
          access.blur(this, d);
          return;
      }
      const target = neighbor(this, key);
      if (target) {
        event.preventDefault();
        moveFocus(this, target);
      }
    });
}

/**
 * Puts the chart's one Tab stop (`tabindex="0"`) on its first mark that can take focus, and takes
 * it off every other. Call once a chart's marks are drawn, and again whenever marks can have been
 * hidden - by zoom, say - so Tab doesn't land on one that can't be focused and skip the chart.
 * Leaves it where it is when that mark can still take focus, so coming back to the chart returns
 * to the mark last visited.
 */
export function refreshTabStop(root: Element | null): void {
  if (!root) {
    return;
  }
  const marks = navigableMarks(root);
  const current = marks.find((mark) => mark.getAttribute('tabindex') === '0');
  const stop = current ?? marks[0];
  for (const mark of root.querySelectorAll(`[${MARK_ATTR}]`)) {
    mark.setAttribute('tabindex', mark === stop ? '0' : '-1');
  }
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

