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
  const position = line.axis === 'x'
    ? scales.x(xFormat === PcacFormatEnum.DateTime ? new Date(line.value) : Number(line.value))
    : scales.y(Number(line.value));
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

/**
 * Draws `labels` into a `.corner-labels` group, each a `.corner-label` inset from its corner of
 * the plot area. Pinned to the frame, so zoom leaves them alone. Hidden from screen readers, as
 * the grid is.
 */
export function drawCornerLabels(
  svg: Selection<SVGGElement, unknown, BaseType, unknown>,
  labels: PcacCornerLabels | undefined,
  width: number,
  height: number,
): void {
  if (!labels) {
    return;
  }
  const corners = [
    { text: labels.topLeft, x: CORNER_INSET, y: CORNER_INSET, anchor: 'start', baseline: 'hanging', name: 'top-left' },
    { text: labels.topRight, x: width - CORNER_INSET, y: CORNER_INSET, anchor: 'end', baseline: 'hanging', name: 'top-right' },
    { text: labels.bottomLeft, x: CORNER_INSET, y: height - CORNER_INSET, anchor: 'start', baseline: 'auto', name: 'bottom-left' },
    { text: labels.bottomRight, x: width - CORNER_INSET, y: height - CORNER_INSET, anchor: 'end', baseline: 'auto', name: 'bottom-right' },
  ].filter((corner) => !!corner.text);
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
    .text((corner) => corner.text!);
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
