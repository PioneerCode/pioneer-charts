import { ElementRef, Injectable } from '@angular/core';
import { select, Selection } from 'd3-selection';
// Imported for its side effect only: adds .transition() to d3-selection's Selection.
import 'd3-transition';
import { Subject } from 'rxjs';

import { PcacChart, PcacTooltipOptions } from '../core/chart';
import { PcacData } from '../core/chart.model';
import { makeMarksAccessible } from '../core/marks';
import { formatValue } from '../core/tick-format';
import { PcacProximityChartConfig } from './proximity-chart.model';
import { PcacProximityPlacement, placeProximity, proximityDistance } from './proximity-layout';

/** Space kept between the center's mark and the nearest an item can sit, in px. */
const CENTER_GAP = 6;
/** Room kept outside the rim for a ring label, in px. */
const RIM_LABEL_ROOM = 4;
/** Room a name takes below its item with `showLabels` - the gap and one line of 11px text - in px. */
const ITEM_LABEL_ROOM = 16;

/** The center, or one item around it, as the builder draws it. */
interface PlaProximityMark {
  data: PcacData;
  /** `null` for the center. */
  placement: PcacProximityPlacement | null;
  x: number;
  y: number;
  size: number;
  color: string;
}

/**
 * Provided per-component (see PcacProximityChart's `providers`), like every builder that extends
 * PcacChart: it holds per-chart-instance state, which a root singleton would share between charts.
 */
@Injectable()
export class ProximityChartBuilder extends PcacChart {
  private itemClickedSource = new Subject<PcacData>();
  itemClicked$ = this.itemClickedSource.asObservable();

  protected override chartTypeLabel = 'Proximity chart';

  buildChart(chartElm: ElementRef, config: PcacProximityChartConfig): void {
    this.hideTooltip();
    if (!config?.center && !config?.data?.length) {
      this.clearChart(chartElm);
      return;
    }
    // No axes, so an even margin all round rather than the axis charts' defaults.
    this.margin = { top: 8, right: 8, bottom: 8, left: 8 };
    if (!this.initializeChartState(chartElm, config)) {
      return;
    }
    const defaults = new PcacProximityChartConfig();
    const closeValue = config.closeValue ?? defaults.closeValue!;
    const farValue = config.farValue ?? defaults.farValue!;
    const centerSize = config.centerSize ?? defaults.centerSize!;
    const itemSize = config.itemSize ?? defaults.itemSize!;
    const placements = placeProximity(config.data ?? [], closeValue, farValue, config.startAngle ?? defaults.startAngle!);
    this.ensureColorCount(placements.length + 1);
    this.applyColorOverride(config.colorOverride);

    // Items run from just outside the center's mark to the rim, their own half-size kept inside it -
    // and, with names under them, the name of an item at the bottom of the rim too.
    const inner = centerSize / 2 + CENTER_GAP + itemSize / 2;
    const edgeRoom = itemSize / 2 + (config.showLabels ? ITEM_LABEL_ROOM : RIM_LABEL_ROOM);
    const outer = Math.max(inner, Math.min(this.width, this.height) / 2 - edgeRoom);
    const radiusOf = (distance: number) => inner + distance * (outer - inner);

    this.buildContainer(chartElm, true);
    // Ring labels go halfway between the first two items, where no item sits to cover them.
    const labelAngle = (((config.startAngle ?? defaults.startAngle!) * Math.PI) / 180) + Math.PI / Math.max(1, placements.length);
    this.drawRings(config, closeValue, farValue, radiusOf, labelAngle);

    const marks: PlaProximityMark[] = placements.map((p) => {
      const r = radiusOf(p.distance);
      return {
        data: p.data,
        placement: p,
        x: r * Math.sin(p.angle),
        y: -r * Math.cos(p.angle),
        size: itemSize,
        color: this.colors[(p.index + 1) % this.colors.length],
      };
    });
    if (config.showSpokes ?? defaults.showSpokes!) {
      this.svg.append('g')
        .attr('class', 'pcac-proximity-spokes')
        .attr('aria-hidden', 'true')
        .selectAll('line')
        .data(marks)
        .enter().append('line')
        .attr('class', 'pcac-proximity-spoke')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', (m) => m.x).attr('y2', (m) => m.y);
    }
    const center: PlaProximityMark | null = config.center
      ? { data: config.center, placement: null, x: 0, y: 0, size: centerSize, color: this.colors[0] }
      : null;
    this.drawMarks(center ? [...marks, center] : marks, config);
    this.restoreTabStop(chartElm);
  }

  /** Faint guide rings at `config.rings`' values, each labelled at `labelAngle` in `config.format`. */
  private drawRings(
    config: PcacProximityChartConfig,
    closeValue: number,
    farValue: number,
    radiusOf: (d: number) => number,
    labelAngle: number,
  ): void {
    const rings = (config.rings ?? []).filter((v) => Number.isFinite(v));
    if (!rings.length) {
      return;
    }
    const groups = this.svg.append('g')
      .attr('class', 'pcac-proximity-rings')
      .attr('aria-hidden', 'true')
      .selectAll('g')
      .data(rings)
      .enter().append('g')
      .attr('class', 'pcac-proximity-ring');
    const r = (v: number) => radiusOf(proximityDistance(v, closeValue, farValue));
    groups.append('circle').attr('r', r).attr('fill', 'none');
    groups.append('text')
      .attr('class', 'pcac-proximity-ring-label')
      .attr('x', (v) => r(v) * Math.sin(labelAngle))
      .attr('y', (v) => -r(v) * Math.cos(labelAngle))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text((v) => formatValue(config.format, v) ?? String(v));
  }

  private drawMarks(marks: PlaProximityMark[], config: PcacProximityChartConfig): void {
    const self = this;
    const duration = this.transitionService.getTransitionDuration();
    const tooltipOptions = (m: PlaProximityMark, anchor: Element | null): PcacTooltipOptions => ({
      index: m.placement?.index ?? -1,
      parent: null,
      valueFormat: config.format,
      anchor,
    });
    const markOf = (group: SVGGElement) => select(group).select('.pcac-proximity-dot, .pcac-proximity-image').node() as Element | null;
    const highlight = (group: SVGGElement, on: boolean) => select(group).classed('is-active', on);

    const groups: Selection<SVGGElement, PlaProximityMark, SVGGElement, unknown> = this.svg.append('g')
      .attr('class', 'pcac-proximity-items')
      .selectAll<SVGGElement, PlaProximityMark>('g')
      .data(marks)
      .enter().append('g')
      .attr('class', (m) => m.placement ? 'pcac-proximity-item' : 'pcac-proximity-item pcac-proximity-center')
      .attr('transform', (m) => `translate(${m.x}, ${m.y})`)
      .on('mouseover', function (this: SVGGElement, event: MouseEvent, m: PlaProximityMark) {
        highlight(this, true);
        self.showTooltip(event, m.data, tooltipOptions(m, markOf(this)));
      })
      .on('mouseout', function (this: SVGGElement) {
        highlight(this, false);
        self.hideTooltip();
      })
      .on('click', (_event: MouseEvent, m: PlaProximityMark) => this.itemClickedSource.next(m.data));

    makeMarksAccessible(groups, {
      label: (m) => m.placement
        ? this.markLabel(m.data, { valueFormat: config.format })
        : `${m.data.key ?? ''}, in the center`,
      activate: (m) => this.itemClickedSource.next(m.data),
      focus: (group, m) => {
        highlight(group, true);
        this.showMarkTooltip(group, m.data, tooltipOptions(m, markOf(group)));
      },
      blur: (group) => {
        highlight(group, false);
        this.hideMarkTooltip(group);
      },
    });

    groups.filter((m) => !m.data.image)
      .append('circle')
      .attr('class', 'pcac-proximity-dot')
      .attr('r', (m) => m.size / 2)
      .attr('fill', (m) => m.color)
      // What the theme's hover ring (`stroke: currentColor`) takes: the dot's own color.
      .style('color', (m) => m.color);
    groups.filter((m) => !!m.data.image)
      .append('image')
      .attr('class', 'pcac-proximity-image')
      .attr('href', (m) => m.data.image as string)
      .attr('width', (m) => m.size)
      .attr('height', (m) => m.size)
      .attr('x', (m) => -m.size / 2)
      .attr('y', (m) => -m.size / 2)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    if (config.showLabels) {
      groups.append('text')
        .attr('class', 'pcac-proximity-label')
        .attr('aria-hidden', 'true')
        .attr('y', (m) => m.size / 2 + 12)
        .attr('text-anchor', 'middle')
        .text((m) => String(m.data.key ?? ''));
    }

    // The items fade in from the center outward, closest first.
    groups.attr('opacity', 0)
      .transition()
      .delay((m) => (m.placement ? m.placement.distance * duration / 2 : 0))
      .duration(duration / 2)
      .attr('opacity', 1);
  }
}
