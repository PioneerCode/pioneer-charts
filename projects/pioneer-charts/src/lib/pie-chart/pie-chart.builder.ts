import { Injectable, ElementRef } from '@angular/core';

/**
 * D3
 */
import { arc, pie, Arc, Pie, PieArcDatum } from 'd3-shape';
import { BaseType, select, Selection } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { active, transition } from 'd3-transition';
import { color } from 'd3-color';

/**
 * Lib
 */
import { PcacPieChartConfig, PcacPieDonutConfig } from './pie-chart.model';
import { PcacChart } from '../core/chart';
import { PcacData } from '../core/chart.model';

import { Subject } from 'rxjs';


/** The largest `PcacPieDonutConfig.innerRadius` honored, so a ring is always left to draw. */
const MAX_DONUT_INNER_RADIUS = 0.9;

/** Smallest font a center line is drawn at; a line that can't fit the hole at this size is left out. */
const MIN_CENTER_FONT_SIZE = 8;

/** Share of the hole's diameter the center text may span, leaving a margin inside the ring. */
const CENTER_TEXT_WIDTH = 1.6;

/**
 * Average glyph width as a fraction of font size. Only used where text can't be measured (no
 * layout, e.g. jsdom); in a browser each line is measured and scaled to fit instead.
 */
const ESTIMATED_GLYPH_WIDTH = 0.6;

/**
 * Provided per-component (see PcacPieChartComponent's `providers`), not root-scoped:
 * this builder extends PcacChart, which holds mutable per-chart-instance state (margin, width,
 * height, colors, svg). A root singleton would be shared and clobbered by every
 * <pcac-pie-chart> rendered at once.
 */
@Injectable()
export class PieChartBuilder extends PcacChart {
  private radius!: number;
  private innerRadius = 0;
  private arcShape!: Arc<any, PieArcDatum<PcacData>>;
  private arcOverShape!: Arc<any, PieArcDatum<PcacData>>;
  private pieAngles!: Pie<any, PcacData>;
  private sliceClickedSource = new Subject<PcacData>();
  sliceClicked$ = this.sliceClickedSource.asObservable();

  protected override chartTypeLabel = 'Pie chart';

  buildChart(chartElm: ElementRef, config: PcacPieChartConfig): void {
    if (!config?.data?.length) {
      this.clearChart(chartElm);
      return;
    }

    // The pie deliberately opts out of `heightFull`: `height` here feeds the radius rather than a
    // drawing area, so growing into a tall container would silently change the size of the pie
    // itself. `PcacPieChartConfig` inherits the property from PcacChartConfig, so it's neutralized
    // here rather than being absent from the type. (`<pcac-pie-chart>` also never gets the
    // `pcac-height-full` class the other charts use to stretch their host.)
    if (!this.initializeChartState(chartElm, { ...config, heightFull: false })) {
      return;
    }
    this.applyColorOverride(config.colorOverride);
    this.radius = Math.min(this.height, this.width) / 2;
    this.buildShapes(config.donut);
    this.drawChart(chartElm, config);
    if (config.donut && this.innerRadius > 0) {
      this.drawCenter(config.donut);
    }
  }

  private buildShapes(donut: Partial<PcacPieDonutConfig> | undefined): void {
    const radiusOffset = 10;
    // Never negative: in a container under 20px the offset would otherwise turn the pie inside out.
    const outerRadius = Math.max(0, this.radius - radiusOffset);
    const ratio = donut ? (donut.innerRadius ?? new PcacPieDonutConfig().innerRadius) : 0;
    // Sized against the resting slice, so the hole stays put when a hovered slice grows outward.
    this.innerRadius = Math.max(0, outerRadius * Math.min(Math.max(ratio, 0), MAX_DONUT_INNER_RADIUS));

    this.arcShape = arc<any, PieArcDatum<PcacData>>()
      .innerRadius(this.innerRadius)
      .outerRadius(outerRadius);

    this.arcOverShape = arc<any, PieArcDatum<PcacData>>()
      .innerRadius(this.innerRadius)
      .outerRadius(outerRadius + radiusOffset);

    this.pieAngles = pie<PcacData>()
      .sort(null)
      // A hidden slice takes no angle but keeps its index - and so its color, matching a legend -
      // the same way a hidden line/area/plot series keeps its place.
      .value((d: PcacData) => (d.hide ? 0 : Number(d.value ?? 0)));
  }

  private drawChart(chartElm: ElementRef, config: PcacPieChartConfig): void {
    this.buildContainer(chartElm, true);
    const self = this;
    this.svg.selectAll('.pcac-arc')
      .data(this.pieAngles(config.data))
      .enter().append('g')
      .attr('class', 'pcac-arc')
      .append('path')
      .style('fill', (d: PieArcDatum<PcacData>, i: number) => {
        return this.colors[i];
      })
      .on('mouseover', function (this: SVGPathElement, _: MouseEvent, d: PieArcDatum<PcacData>) {
        const t = transition().duration(self.transitionService.getTransitionDuration() / 3)
        const c = color(self.colors[d.index])
        const ct = c ? c.darker(1).toString() : self.colors[d.index]
        const slice = select<SVGPathElement, PieArcDatum<PcacData>>(this);
        // Hovered mid-way through the enter sweep, the slice is finished first: growing it straight
        // from its part-swept path morphed it oddly on the way out to the hover shape. Only then -
        // re-entering a slice mid-way through its hover shrink must grow it from where it is, not
        // snap it back to rest first (which flickered).
        if (active(this, 'enter')) {
          slice.interrupt('enter').attr('d', self.arcShape(d));
        }
        slice
          .transition(t)
          .attr('d', self.arcOverShape)
          .style('fill', ct);
      })
      .on('mousemove', (event: MouseEvent, d: PieArcDatum<PcacData>) => {
        self.showTooltip(event, d.data, { index: d.index });
      })
      .on('mouseout', function (this: SVGPathElement, _: MouseEvent, d: PieArcDatum<PcacData>) {
        self.hideTooltip();
        select<SVGPathElement, PieArcDatum<PcacData>>(this)
          .transition()
          .duration(self.transitionService.getTransitionDuration() / 3)
          .attr('d', self.arcShape)
          .style('fill', self.colors[d.index]);
      })
      .on('click', (_event: MouseEvent, d: PieArcDatum<PcacData>) => {
        this.sliceClickedSource.next(d.data);
      })
      // Named, so the hover transitions (unnamed) and the check above can tell it apart from them.
      .transition('enter')
      .duration(this.transitionService.getTransitionDuration())
      .attrTween('d', (b: PieArcDatum<PcacData>) => {
        return this.tweenChart(b);
      });
  }

  /**
   * The donut's `label` / `subLabel`, stacked around the center of the hole. Each line starts at a
   * size proportional to the hole and shrinks until it fits across it; a line that would have to
   * drop below `MIN_CENTER_FONT_SIZE` is left out rather than spill over the slices. Drawn after
   * the slices and ignoring the pointer, so it never blocks a slice's hover or click.
   */
  private drawCenter(donut: Partial<PcacPieDonutConfig>): void {
    if (!donut.label && !donut.subLabel) {
      return;
    }
    const maxWidth = this.innerRadius * CENTER_TEXT_WIDTH;

    const center = this.svg.append('g')
      .attr('class', 'pcac-pie-center')
      .attr('pointer-events', 'none')
      .style('--pcac-pie-center-label-color', () => donut.labelColor ?? null)
      .style('--pcac-pie-center-sub-label-color', () => donut.subLabelColor ?? null);

    const label = this.drawCenterLine(center, 'pcac-pie-center-label', donut.label,
      Math.min(this.innerRadius * 0.5, 40), maxWidth);
    const subLabel = this.drawCenterLine(center, 'pcac-pie-center-sub-label', donut.subLabel,
      Math.min(this.innerRadius * 0.2, 16), maxWidth);

    if (!label && !subLabel) {
      center.remove();
      return;
    }
    // Stacked as a pair about the center; a line on its own sits on it.
    if (label && subLabel) {
      label.element.attr('y', -subLabel.size * 0.6);
      subLabel.element.attr('y', label.size * 0.55);
    }
  }

  /**
   * One centered line of the donut's center text at the largest size up to `preferredSize` that
   * fits `maxWidth`, or nothing (null) when there's no text or it can't fit at a readable size.
   */
  private drawCenterLine(
    center: Selection<SVGGElement, unknown, BaseType, unknown>,
    className: string,
    text: string | undefined,
    preferredSize: number,
    maxWidth: number,
  ): { element: Selection<SVGTextElement, unknown, BaseType, unknown>; size: number } | null {
    if (!text || preferredSize < MIN_CENTER_FONT_SIZE) {
      return null;
    }
    const element = center.append('text')
      .attr('class', className)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', `${preferredSize}px`)
      .text(text);

    const node = element.node();
    const measured = node && typeof node.getComputedTextLength === 'function'
      ? node.getComputedTextLength()
      : 0;
    const width = measured > 0 ? measured : text.length * preferredSize * ESTIMATED_GLYPH_WIDTH;
    const size = width > maxWidth ? preferredSize * (maxWidth / width) : preferredSize;
    if (size < MIN_CENTER_FONT_SIZE) {
      element.remove();
      return null;
    }
    element.style('font-size', `${size}px`);
    return { element, size };
  }

  private tweenChart(b: PieArcDatum<PcacData>) {
    const i = interpolate({ startAngle: 0, endAngle: 0 }, b);
    return (t: number) => this.arcShape(i(t)) ?? '';
  }
}
