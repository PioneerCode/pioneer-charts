import { ElementRef, Injectable } from '@angular/core';
import { select, Selection } from 'd3-selection';
// Imported for its side effect only: adds .transition() to d3-selection's Selection.
import 'd3-transition';
import { Subject } from 'rxjs';

import { PcacChart, PcacTooltipOptions } from '../core/chart';
import { PcacData } from '../core/chart.model';
import { makeMarksAccessible } from '../core/marks';
import { PcacStateTimelineConfig } from './state-timeline.model';
import { PcacStatePeriod, periodGap, periodLabel, periodSummary, placePeriods } from './state-timeline-layout';

/** Room kept round the plot for a focused period's ring (2px, 2px out), in px. */
const FOCUS_ROOM = 4;
/** Space between rows, in px. */
const ROW_GAP = 4;
/** Space between a row's label and its periods, in px. */
const LABEL_GAP = 8;
/** The most of the chart's width the row labels take; a longer one is cut off at the left edge. */
const MAX_LABEL_SHARE = 0.4;
/** A label's width where text can't be measured (no layout), per character, in px: 11px text. */
const LABEL_CHAR_WIDTH = 6.5;

/** Each chart's own stripes pattern, by a number no other chart on the page has. */
let nextStripesId = 0;

/**
 * Provided per-component (see PcacStateTimeline's `providers`), like every builder that extends
 * PcacChart: it holds per-chart-instance state, which a root singleton would share between charts.
 */
@Injectable()
export class StateTimelineBuilder extends PcacChart {
  private periodClickedSource = new Subject<PcacData>();
  periodClicked$ = this.periodClickedSource.asObservable();

  protected override chartTypeLabel = 'State timeline';

  private readonly stripesId = `pcac-state-stripes-${nextStripesId++}`;

  buildChart(chartElm: ElementRef, config: PcacStateTimelineConfig): void {
    this.hideTooltip();
    const states = config?.states ?? [];
    const placed = placePeriods(config?.data ?? [], states);
    if (!placed.length) {
      this.clearChart(chartElm);
      return;
    }
    const rows = config.data.filter((row) => !row.hide);
    const labelRoom = (config.rowLabels ?? true) ? this.labelRoom(chartElm, rows) : 0;
    this.margin = { top: FOCUS_ROOM, right: FOCUS_ROOM, bottom: FOCUS_ROOM, left: FOCUS_ROOM + labelRoom };
    if (!this.initializeChartState(chartElm, config)) {
      return;
    }
    this.buildContainer(chartElm);
    this.drawStripes();

    const rowHeight = Math.max(1, (this.height - ROW_GAP * (rows.length - 1)) / rows.length);
    const gap = config.gap ?? new PcacStateTimelineConfig().gap!;
    // Each row shares the width between its own periods
    const counts = rows.map((_, i) => placed.filter((p) => p.rowIndex === i).length);
    const layout = (p: PcacStatePeriod) => {
      const count = counts[p.rowIndex];
      const space = periodGap(this.width, count, gap);
      const width = (this.width - space * (count - 1)) / count;
      return { x: p.index * (width + space), y: p.rowIndex * (rowHeight + ROW_GAP), width };
    };

    if (labelRoom) {
      this.svg.append('g')
        .attr('class', 'pcac-state-row-labels')
        .attr('aria-hidden', 'true')
        .selectAll('text')
        .data(rows)
        .enter().append('text')
        .attr('class', 'pcac-state-row-label')
        .attr('x', -LABEL_GAP)
        .attr('y', (_, i) => i * (rowHeight + ROW_GAP) + rowHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .text((row) => String(row.key ?? ''));
    }
    this.drawPeriods(placed, config, rowHeight, layout);
    this.restoreTabStop(chartElm);
  }

  /** Room for the longest row label and its gap, never more than MAX_LABEL_SHARE of the chart. */
  private labelRoom(chartElm: ElementRef, rows: PcacData[]): number {
    const svg = chartElm.nativeElement as SVGSVGElement;
    const container = svg.parentNode as HTMLElement;
    const widths = rows.map((row) => {
      const text = String(row.key ?? '');
      const probe = select(svg).append('text').attr('class', 'pcac-state-row-label').text(text);
      const node = probe.node() as SVGTextElement;
      const width = typeof node.getComputedTextLength === 'function' ? node.getComputedTextLength() : text.length * LABEL_CHAR_WIDTH;
      probe.remove();
      return width;
    });
    const longest = Math.max(0, ...widths);
    return longest ? Math.min(longest + LABEL_GAP, (container?.clientWidth ?? 0) * MAX_LABEL_SHARE) : 0;
  }

  /** The stripes laid over a period part of which is unknown, this chart's own. */
  private drawStripes(): void {
    this.svg.append('defs')
      .append('pattern')
      .attr('id', this.stripesId)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 6)
      .attr('height', 6)
      .attr('patternTransform', 'rotate(45)')
      .append('rect')
      .attr('class', 'pcac-state-stripe')
      .attr('width', 3)
      .attr('height', 6);
  }

  private drawPeriods(
    placed: PcacStatePeriod[],
    config: PcacStateTimelineConfig,
    rowHeight: number,
    layout: (p: PcacStatePeriod) => { x: number; y: number; width: number },
  ): void {
    const self = this;
    const states = config.states;
    const last = states.length - 1;
    const role = (p: PcacStatePeriod) => p.state === null ? 'unknown'
      : p.state === 0 ? 'ok'
        : p.state === last ? 'error'
          : 'warning';
    // The default tooltip shows the period's name over what it was in; a template gets the period itself
    const tooltipData = (p: PcacStatePeriod): PcacData =>
      this.tooltipTemplate() ? p.data : { ...p.data, value: periodSummary(p, states) };
    const tooltipOptions = (p: PcacStatePeriod, anchor: Element | null): PcacTooltipOptions => ({
      index: p.index,
      parent: p.row,
      parentIndex: p.rowIndex,
      anchor,
    });
    const fillOf = (group: SVGGElement) => select(group).select('.pcac-state-fill').node() as Element | null;
    const highlight = (group: SVGGElement, on: boolean) => select(group).classed('is-active', on);

    const groups: Selection<SVGGElement, PcacStatePeriod, SVGGElement, unknown> = this.svg.append('g')
      .attr('class', 'pcac-state-periods')
      .selectAll<SVGGElement, PcacStatePeriod>('g')
      .data(placed)
      .enter().append('g')
      .attr('class', (p) => `pcac-state-period pcac-state-${role(p)}`)
      .style('--pcac-state-share', (p) => String(Math.round(p.share * 1000) / 1000))
      .style('--pcac-state-color', (p) => (p.state === null ? null : states[p.state].color) ?? null)
      .on('mouseover', function (this: SVGGElement, event: MouseEvent, p: PcacStatePeriod) {
        highlight(this, true);
        self.showTooltip(event, tooltipData(p), tooltipOptions(p, fillOf(this)));
      })
      .on('mouseout', function (this: SVGGElement) {
        highlight(this, false);
        self.hideTooltip();
      })
      .on('click', (_event: MouseEvent, p: PcacStatePeriod) => this.periodClickedSource.next(p.data));

    makeMarksAccessible(groups, {
      label: (p) => {
        const name = p.row.key === null || p.row.key === undefined || p.row.key === '' ? '' : `${p.row.key}, `;
        return `${name}${periodLabel(p, states)}`;
      },
      activate: (p) => this.periodClickedSource.next(p.data),
      focus: (group, p) => {
        highlight(group, true);
        this.showMarkTooltip(group, tooltipData(p), tooltipOptions(p, fillOf(group)));
      },
      blur: (group) => {
        highlight(group, false);
        this.hideMarkTooltip(group);
      },
    });

    const box = (selection: Selection<SVGRectElement, PcacStatePeriod, SVGGElement, unknown>) => selection
      .attr('x', (p) => layout(p).x)
      .attr('y', (p) => layout(p).y)
      .attr('width', (p) => layout(p).width)
      .attr('height', rowHeight)
      .attr('rx', 2);
    box(groups.append('rect').attr('class', 'pcac-state-fill'));
    box(groups.filter((p) => p.state !== null && p.unknownShare > 0)
      .append('rect')
      .attr('class', 'pcac-state-stripes')
      .attr('fill', `url(#${this.stripesId})`));

    groups.attr('opacity', 0)
      .transition()
      .duration(this.transitionService.getTransitionDuration() / 2)
      .attr('opacity', 1);
  }
}
