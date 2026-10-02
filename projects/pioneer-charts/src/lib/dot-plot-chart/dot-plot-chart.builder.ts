import { ElementRef, Injectable } from '@angular/core';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import { scaleLinear, ScaleLinear } from 'd3-scale';
// Imported for its side effect only: adds .transition() to d3-selection's Selection.
import 'd3-transition';
import { Subject } from 'rxjs';

import { PcacChart, PcacTooltipOptions } from '../core/chart';
import { PcacData } from '../core/chart.model';
import { makeMarksAccessible } from '../core/marks';
import { PcacPointImageConfig } from '../plot-line-area-chart/plot-line-area-chart.model';
import { PcacDotPlotChartConfig } from './dot-plot-chart.model';
import { PcacDotPlacement, stackDots, tallestColumn } from './dot-plot-layout';

/** How much a hovered dot grows, in px of radius - also room kept for it at the plot's edges. */
const DOT_HOVER_GROWTH = 2;

/**
 * Provided per-component (see PcacDotPlotChart's `providers`), like every builder that extends
 * PcacChart: it holds per-chart-instance state, which a root singleton would share between charts.
 */
@Injectable()
export class DotPlotChartBuilder extends PcacChart {
  private dotClickedSource = new Subject<PcacData>();
  dotClicked$ = this.dotClickedSource.asObservable();

  protected override chartTypeLabel = 'Dot plot';

  private xScale!: ScaleLinear<number, number>;
  private placements: PcacDotPlacement[] = [];
  private pointImage!: PcacPointImageConfig;
  /** A mark's size and the gap between stacked marks this build, after any shrinking to fit. */
  private markSize = 0;
  private markGap = 0;
  private dotRadius = 0;

  buildChart(chartElm: ElementRef, config: PcacDotPlotChartConfig): void {
    if (!config?.data?.length) {
      this.hideTooltip();
      this.clearChart(chartElm);
      return;
    }
    this.hideTooltip();

    // A column's height is a count of marks, not a value, so there's no y axis to draw.
    const rawXAxis = config.xAxis;
    config = { ...config, yAxis: { ...config.yAxis, hide: true } };

    const defaults = new PcacDotPlotChartConfig();
    const dotRadius = config.dotRadius ?? defaults.dotRadius!;
    const gap = config.gap ?? defaults.gap!;
    this.pointImage = { ...new PcacPointImageConfig(), ...config.pointImage };
    const origin = rawXAxis?.domainMin !== undefined ? Number(rawXAxis.domainMin) : 0;
    this.placements = stackDots(config.data, config.binWidth, origin);
    const hasImages = this.placements.some((p) => !!p.data.image);
    const hasDots = this.placements.some((p) => !p.data.image);
    const fullSize = hasImages
      ? Math.max(this.pointImage.maxWidth, this.pointImage.maxHeight)
      : 2 * (dotRadius + DOT_HOVER_GROWTH);
    const tallest = tallestColumn(this.placements);
    // `autoTickSize`: half the tallest mark at a given fit - a hovered dot (its growth isn't
    // scaled) or an image's box - toward the x axis.
    const markHalf = (fit: number) => Math.max(
      hasDots ? dotRadius * fit + DOT_HOVER_GROWTH : 0,
      hasImages ? this.pointImage.maxHeight * fit / 2 : 0,
    );

    // The fit shrinks marks to the plot's height, which an auto tick takes its length out of, so
    // with `autoTickSize` the layout is settled in up to three passes: at full size; at the size
    // that fit, if smaller; and - should the height that handed back have grown the marks past
    // that, rounding up a pixel - at the length they now need, which is still no longer than the
    // first, so the marks can only shrink again and never outgrow the tick.
    let tick = markHalf(1);
    for (let pass = 0; ; pass++) {
      if (!this.layout(chartElm, config, tick, fullSize)) {
        return;
      }
      const fit = tallest ? Math.min(1, this.height / (tallest * (fullSize + gap))) : 1;
      this.markSize = fullSize * fit;
      this.markGap = gap * fit;
      this.dotRadius = dotRadius * fit;
      const needed = Math.ceil(markHalf(fit));
      if (!this.xAxis.autoTickSize || this.xAxis.hide || needed === this.xAxis.tickSize || pass === 2) {
        break;
      }
      tick = needed;
    }
    this.ensureColorCount(config.data.length);
    this.applyColorOverride(config.colorOverride);

    this.xScale = this.buildXScale(rawXAxis?.domainMin, rawXAxis?.domainMax);
    this.drawChart(chartElm);
  }

  /**
   * Sets the axes and margins up and measures the plot area, with `tick` as the x axis's length
   * under `autoTickSize`. Returns `initializeChartState`'s result. On a copy of the config each
   * time: initializeAxisState() rewrites `height`, which mustn't reach the consumer's object or
   * build up over passes.
   */
  private layout(chartElm: ElementRef, config: PcacDotPlotChartConfig, tick: number, fullSize: number): boolean {
    config = { ...config };
    this.initializeAxisState(config, 'x', 0, { x: tick, y: 0 });
    // A mark at the domain's edge is centered on it, so half of it hangs past the plot area.
    const half = Math.ceil(fullSize / 2);
    this.reserveEdgeSpace({ left: half, right: half });
    return this.initializeChartState(chartElm, config);
  }

  /**
   * The value axis: `xAxis.domainMin` / `domainMax` where given, otherwise the data's extent
   * rounded out to nice ticks - checked on the consumer's own axis config, since the resolved one
   * fills in 0 - 100 for anything unset.
   */
  private buildXScale(domainMin: number | string | undefined, domainMax: number | string | undefined): ScaleLinear<number, number> {
    const [lo, hi] = extent(this.placements, (p) => p.position) as [number | undefined, number | undefined];
    const min = domainMin !== undefined ? Number(domainMin) : lo ?? 0;
    const max = domainMax !== undefined ? Number(domainMax) : hi ?? 1;
    const scale = scaleLinear().domain(min === max ? [min - 1, max + 1] : [min, max]).range([0, this.width]);
    return domainMin === undefined || domainMax === undefined ? scale.nice(this.xAxis.ticks) : scale;
  }

  private drawChart(chartElm: ElementRef): void {
    this.buildContainer(chartElm);
    const yScale = scaleLinear().domain([0, 1]).range([this.height, 0]);
    this.axisBuilder.drawAxis(this.axisBuilderConfig(this.xScale, yScale));
    this.drawGrids(this.xScale, yScale);
    this.axisBuilder.raiseAxes(this.svg);
    this.drawDots();
    this.restoreTabStop(chartElm);
  }

  /** The center of a placed point's mark, in plot pixels: its column's x, its level's y. */
  private center(p: PcacDotPlacement): { x: number; y: number } {
    const step = this.markSize + this.markGap;
    return {
      x: this.xScale(p.position),
      y: this.height - this.markGap - this.markSize / 2 - p.level * step,
    };
  }

  private drawDots(): void {
    const self = this;
    const duration = this.transitionService.getTransitionDuration();
    const { maxWidth, maxHeight } = this.pointImage;
    const fit = this.markSize / (this.placements.some((p) => !!p.data.image) ? Math.max(maxWidth, maxHeight) : 1);
    const imageWidth = maxWidth * fit;
    const imageHeight = maxHeight * fit;
    const color = (p: PcacDotPlacement) => this.colors[p.seriesIndex];
    const tooltipOptions = (p: PcacDotPlacement, anchor: Element | null = null): PcacTooltipOptions => ({
      index: p.index,
      parent: p.series,
      parentIndex: p.seriesIndex,
      valueFormat: this.xAxis.format,
      anchor,
    });
    const grow = (mark: SVGGElement, p: PcacDotPlacement, hovered: boolean) => {
      select(mark).select('.pcac-dot')
        .interrupt('hover')
        .transition('hover')
        .duration(duration / 3)
        .attr('r', hovered ? this.dotRadius + DOT_HOVER_GROWTH : this.dotRadius)
        .attr('fill', hovered ? color(p) : 'var(--pcac-dot-fill, #fff)');
    };

    const marks = this.svg.append('g')
      .attr('class', 'pcac-dots')
      .selectAll<SVGGElement, PcacDotPlacement>('.pcac-dot-mark')
      .data(this.placements)
      .enter().append('g')
      .attr('class', 'pcac-dot-mark')
      .attr('transform', (p) => `translate(${this.center(p).x}, ${this.center(p).y})`)
      .on('mouseover', function (this: SVGGElement, event: MouseEvent, p: PcacDotPlacement) {
        grow(this, p, true);
        self.showTooltip(event, p.data, tooltipOptions(p, select(this).select('.pcac-dot, .pcac-dot-image').node() as Element | null));
      })
      .on('mouseout', function (this: SVGGElement, _event: MouseEvent, p: PcacDotPlacement) {
        grow(this, p, false);
        self.hideTooltip();
      })
      .on('click', (_event: MouseEvent, p: PcacDotPlacement) => this.dotClickedSource.next(p.data));

    makeMarksAccessible(marks, {
      label: (p) => this.markLabel(p.data, { parent: p.series, valueFormat: this.xAxis.format }),
      activate: (p) => this.dotClickedSource.next(p.data),
      focus: (mark, p) => {
        grow(mark, p, true);
        this.showMarkTooltip(mark, p.data, tooltipOptions(p, select(mark).select('.pcac-dot, .pcac-dot-image').node() as Element | null));
      },
      blur: (mark, p) => {
        grow(mark, p, false);
        this.hideMarkTooltip(mark);
      },
    });

    // Each column builds up from the axis: a mark fades in a beat after the one below it.
    const delay = (p: PcacDotPlacement) => Math.min(p.level * 40, duration);
    marks.filter((p) => !p.data.image)
      .append('circle')
      .attr('class', 'pcac-dot')
      .attr('r', this.dotRadius)
      .attr('stroke', color)
      .attr('fill', 'var(--pcac-dot-fill, #fff)')
      .attr('opacity', 0)
      .transition()
      .delay(delay)
      .duration(duration / 2)
      .attr('opacity', 1);

    marks.filter((p) => !!p.data.image)
      .append('image')
      .attr('class', 'pcac-dot-image')
      .attr('href', (p) => p.data.image as string)
      .attr('width', imageWidth)
      .attr('height', imageHeight)
      .attr('x', -imageWidth / 2)
      .attr('y', -imageHeight / 2)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('opacity', 0)
      .transition()
      .delay(delay)
      .duration(duration / 2)
      .attr('opacity', 1);
  }
}
