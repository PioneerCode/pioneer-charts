import { BaseType, Selection } from 'd3-selection';
import { PcacFormatEnum } from '../../../core/chart.model';
import { PcacCornerLabels, PcacReferenceLine } from '../../plot-line-area-chart.model';
import { PlaChartScales } from './scales.builder';

/** How far a reference line's label, and a corner label, sits in from what it's attached to, in px. */
const LABEL_INSET = 4;
const CORNER_INSET = 8;

/** A `PcacReferenceLine` with its defaults filled in. */
type PlaReferenceLine = PcacReferenceLine;

/**
 * Where a reference line sits on its axis, in plot pixels, or `null` when its value doesn't place
 * (a date that won't parse, a non-numeric value) - such a line isn't drawn. An x value is read the
 * way a point's `key` is under the axis's format (see `getXFormat`).
 */
export function referenceLinePosition(
  line: PlaReferenceLine,
  scales: PlaChartScales,
  xFormat: PcacFormatEnum | undefined,
): number | null {
  return valuePosition(line.axis, line.value, scales, xFormat);
}

/** Where `value` sits on `axis`, in plot pixels, or `null` when it doesn't place. */
function valuePosition(
  axis: 'x' | 'y',
  value: number | string,
  scales: PlaChartScales,
  xFormat: PcacFormatEnum | undefined,
): number | null {
  const position = axis === 'x'
    ? scales.x(xFormat === PcacFormatEnum.DateTime ? new Date(value) : Number(value))
    : scales.y(Number(value));
  return Number.isFinite(position) ? position : null;
}

/**
 * Draws `lines` into one `.reference-lines` group, clipped to the plot (`clipPathId`) so a line
 * zoomed past an edge disappears there, each a `.reference-line` group holding the dashed `<line>`.
 * Their labels go in a `.reference-line-labels` group of their own, clipped the same way, so they
 * can be raised over the series (`raiseLabels`) without the lines. Both hidden from screen readers,
 * as the grid is.
 */
export function drawReferenceLines(
  svg: Selection<SVGGElement, unknown, BaseType, unknown>,
  lines: Partial<PcacReferenceLine>[] | undefined,
  scales: PlaChartScales,
  xFormat: PcacFormatEnum | undefined,
  width: number,
  height: number,
  clipPathId: string,
): void {
  if (!lines?.length) {
    return;
  }
  const resolved = lines.map((line): PlaReferenceLine => ({ ...new PcacReferenceLine(), ...line }));
  const groups = svg.append('g')
    .attr('class', 'reference-lines')
    .attr('clip-path', `url(#${clipPathId})`)
    .attr('aria-hidden', 'true')
    .selectAll('.reference-line')
    .data(resolved)
    .enter().append('g')
    .attr('class', (line: PlaReferenceLine) => `reference-line reference-line-${line.axis}`)
    .style('--pcac-reference-line-color', (line: PlaReferenceLine) => line.color ?? null);
  groups.append('line').attr('class', 'reference-line-stroke');
  const labelled = resolved.filter((line) => !!line.label);
  if (labelled.length) {
    svg.append('g')
      .attr('class', 'reference-line-labels')
      .attr('clip-path', `url(#${clipPathId})`)
      .attr('aria-hidden', 'true')
      .selectAll('.reference-line-label')
      .data(labelled)
      .enter().append('text')
      .attr('class', (line: PlaReferenceLine) => `reference-line-label reference-line-label-${line.axis}`)
      .style('--pcac-reference-line-color', (line: PlaReferenceLine) => line.color ?? null)
      .text((line: PlaReferenceLine) => line.label!);
  }
  positionReferenceLines(svg, scales, xFormat, width, height);
}

/**
 * Places the chart's reference lines, and their labels, against `scales` - on the first draw and
 * again on every zoom. A horizontal line's label sits above its right end, or its left with
 * `labelPosition: 'start'`; a vertical line's beside its top, or its bottom.
 */
export function positionReferenceLines(
  svg: Selection<SVGGElement, unknown, BaseType, unknown>,
  scales: PlaChartScales,
  xFormat: PcacFormatEnum | undefined,
  width: number,
  height: number,
): void {
  const hidden = (line: PlaReferenceLine) => referenceLinePosition(line, scales, xFormat) === null ? 'none' : null;
  const groups = svg.selectAll<SVGGElement, PlaReferenceLine>('.reference-line').attr('display', hidden);
  const at = (line: PlaReferenceLine) => referenceLinePosition(line, scales, xFormat) ?? 0;
  const atStart = (line: PlaReferenceLine) => line.labelPosition === 'start';
  groups.select('.reference-line-stroke')
    .attr('x1', (line: PlaReferenceLine) => line.axis === 'x' ? at(line) : 0)
    .attr('x2', (line: PlaReferenceLine) => line.axis === 'x' ? at(line) : width)
    .attr('y1', (line: PlaReferenceLine) => line.axis === 'x' ? 0 : at(line))
    .attr('y2', (line: PlaReferenceLine) => line.axis === 'x' ? height : at(line));
  svg.selectAll<SVGTextElement, PlaReferenceLine>('.reference-line-label')
    .attr('display', hidden)
    .attr('x', (line: PlaReferenceLine) => line.axis === 'x'
      ? at(line) + LABEL_INSET
      : atStart(line) ? LABEL_INSET : width - LABEL_INSET)
    .attr('y', (line: PlaReferenceLine) => line.axis === 'x'
      ? atStart(line) ? height - LABEL_INSET : LABEL_INSET
      : at(line) - LABEL_INSET)
    .attr('text-anchor', (line: PlaReferenceLine) => line.axis === 'y' && !atStart(line) ? 'end' : 'start')
    .attr('dominant-baseline', (line: PlaReferenceLine) => line.axis === 'x' && !atStart(line) ? 'hanging' : 'auto');
}

/** One corner's label: which corner, so which region of a `split`, and where it's drawn. */
interface PlaCornerLabel {
  text: string;
  name: string;
  left: boolean;
  top: boolean;
  x: number;
  y: number;
  anchor: string;
  baseline: string;
}

/**
 * Draws `labels` into a `.corner-labels` group, each a `.corner-label` inset from its corner of
 * the plot area, then shows or hides them for the current view (`positionCornerLabels`). Hidden
 * from screen readers, as the grid is.
 */
export function drawCornerLabels(
  svg: Selection<SVGGElement, unknown, BaseType, unknown>,
  labels: PcacCornerLabels | undefined,
  scales: PlaChartScales,
  xFormat: PcacFormatEnum | undefined,
  width: number,
  height: number,
): void {
  if (!labels) {
    return;
  }
  const corners = [
    { text: labels.topLeft, left: true, top: true, x: CORNER_INSET, y: CORNER_INSET, anchor: 'start', baseline: 'hanging', name: 'top-left' },
    { text: labels.topRight, left: false, top: true, x: width - CORNER_INSET, y: CORNER_INSET, anchor: 'end', baseline: 'hanging', name: 'top-right' },
    { text: labels.bottomLeft, left: true, top: false, x: CORNER_INSET, y: height - CORNER_INSET, anchor: 'start', baseline: 'auto', name: 'bottom-left' },
    { text: labels.bottomRight, left: false, top: false, x: width - CORNER_INSET, y: height - CORNER_INSET, anchor: 'end', baseline: 'auto', name: 'bottom-right' },
  ].filter((corner): corner is PlaCornerLabel => !!corner.text);
  if (corners.length === 0) {
    return;
  }
  svg.append('g')
    .attr('class', 'corner-labels')
    .attr('aria-hidden', 'true')
    .style('--pcac-corner-label-color', () => labels.color ?? null)
    .selectAll('.corner-label')
    .data(corners)
    .enter().append('text')
    .attr('class', (corner) => `corner-label corner-label-${corner.name}`)
    .attr('x', (corner) => corner.x)
    .attr('y', (corner) => corner.y)
    .attr('text-anchor', (corner) => corner.anchor)
    .attr('dominant-baseline', (corner) => corner.baseline)
    .text((corner) => corner.text);
  positionCornerLabels(svg, labels, scales, xFormat, width, height);
}

/**
 * Shows each corner label only while its region of `labels.split` fills its corner of the view
 * with room for the label and its inset - on the first draw and again on every zoom. The labels
 * themselves never move: a region still in view always reaches its own corner of the plot, so
 * there's nowhere else to put one, only whether it's still true there. Without a `split` every
 * label is shown, as it always was.
 */
export function positionCornerLabels(
  svg: Selection<SVGGElement, unknown, BaseType, unknown>,
  labels: PcacCornerLabels | undefined,
  scales: PlaChartScales,
  xFormat: PcacFormatEnum | undefined,
  width: number,
  height: number,
): void {
  const split = labels?.split;
  if (!split) {
    return;
  }
  // The split in plot pixels, clamped to the plot; an axis without one (or one that won't place)
  // isn't split.
  const at = (axis: 'x' | 'y', length: number) => {
    const value = split[axis];
    const position = value === undefined ? null : valuePosition(axis, value, scales, xFormat);
    return position === null ? null : Math.min(Math.max(position, 0), length);
  };
  const sx = at('x', width);
  const sy = at('y', height);
  svg.selectAll<SVGTextElement, PlaCornerLabel>('.corner-label')
    .attr('display', function (corner: PlaCornerLabel) {
      // y pixels run top-down, so the top region is the one above the split.
      const w = sx === null ? width : corner.left ? sx : width - sx;
      const h = sy === null ? height : corner.top ? sy : height - sy;
      const size = labelSize(this);
      return w > 0 && h > 0 && w >= size.width + 2 * CORNER_INSET && h >= size.height + 2 * CORNER_INSET ? null : 'none';
    });
}

/** A drawn label's size in px; 0 by 0 where it can't be measured (jsdom has no SVG layout). */
function labelSize(label: SVGTextElement): { width: number; height: number } {
  if (typeof label.getBBox !== 'function') {
    return { width: 0, height: 0 };
  }
  // A hidden label measures 0 by 0, so it's shown for the measurement.
  const display = label.getAttribute('display');
  label.removeAttribute('display');
  const { width, height } = label.getBBox();
  if (display !== null) label.setAttribute('display', display);
  return { width, height };
}

/**
 * With `labelsOnTop`, moves the corner labels and reference-line labels above everything drawn
 * so far - the series included - and marks them for the theme's halo. Called after each draw and
 * each zoom, which re-raises the series over the axes it redraws.
 */
export function raiseLabels(svg: Selection<SVGGElement, unknown, BaseType, unknown>): void {
  svg.selectAll('.corner-labels, .reference-line-labels')
    .classed('pcac-labels-on-top', true)
    .raise();
}
