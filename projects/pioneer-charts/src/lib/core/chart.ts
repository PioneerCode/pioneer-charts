import { axisLeft, AxisDomain, AxisScale } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
import { PcacAxisBuilder } from './axis.builder';
import { PcacGridBuilder } from './grid.builder';
import { PcacChartConfig } from './chart.model';
import { PcacColorService } from './color.service';
import { select } from 'd3-selection';
import { ElementRef, inject } from '@angular/core';
import { PcacData } from '.';
import { PcacTransitionService } from './transition.service';
import { PcacTooltipBuilder } from './tooltip.builder';


export interface PcacChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class PcacChart {
  axisBuilder = inject(PcacAxisBuilder);
  gridBuilder = inject(PcacGridBuilder);
  transitionService = inject(PcacTransitionService);
  tooltipBuilder = inject(PcacTooltipBuilder);
  colorService = inject(PcacColorService);

  margin: PcacChartMargin = { top: 8, right: 16, bottom: 20, left: 40 };
  svg!: Selection<SVGGElement, unknown, BaseType, unknown>;
  width = 400;
  height = 400;
  colors = [] as string[];
  startData: PcacData[] = [];

  /**
   * Raw, unadjusted container width measured by the last successful `initializeChartState()`
   * call, or `null` if none has succeeded yet. Deliberately tracked separately from `width`:
   * some builders (e.g. bar-horizontal-chart's `setHorizontalMarginsBasedOnContent`) recompute
   * `width`/`margin.left` mid-build from measured axis-label sizes, so `width` alone isn't a
   * stable basis for "did the container itself resize" — the raw container measurement is.
   */
  private lastContainerWidth: number | null = null;

  /**
   * Raw container height measured by the last successful `initializeChartState()` call, and
   * whether that build was running with `heightFull` on. Only consulted by `containerSizeChanged`
   * when it was: without `heightFull` the container's height is driven *by* the chart's own SVG
   * height, so comparing it would report "changed" every time the chart itself grew or shrank.
   */
  private lastContainerHeight: number | null = null;
  private lastHeightFull = false;

  /**
   * Prior to building a chart, we need to initialize the state of the chart.
   *
   * Returns `false` (and leaves `width`/`height`/`colors` untouched) if the container hasn't
   * been laid out yet, so its `clientWidth` measures 0 — this happens when a chart mounts
   * already holding data (e.g. behind a loading gate) and its first `ngOnChanges` fires before
   * the browser has committed layout for its own just-created DOM node. Callers should bail out
   * of their build on `false` rather than proceeding with a degenerate width; `PcacChartResizeService`
   * (wired up by every chart component) retries the build once the container has a real size.
   * @param chartElm Reference to SVG on dom
   * @param config Chart specific configuration
   */
  initializeChartState(chartElm: ElementRef, config: PcacChartConfig): boolean {
    select(chartElm.nativeElement).select('g').remove();
    const container = chartElm.nativeElement.parentNode as HTMLElement;
    const containerWidth = container.clientWidth;
    const measuredWidth = containerWidth - this.margin.left - this.margin.right;
    if (measuredWidth <= 0) {
      return false;
    }
    this.width = measuredWidth;
    this.height = this.resolveHeight(container, config);
    this.colors = this.colorService.getColorScale(Math.max(config.data.length, config.data[0]?.data ? config.data[0].data.length : 0));
    this.lastContainerWidth = containerWidth;
    this.lastContainerHeight = container.clientHeight;
    this.lastHeightFull = config.heightFull === true;
    return true;
  }

  /**
   * `config.height` normally *is* the height of the drawing area. With `config.heightFull` on it
   * becomes a floor instead: the chart fills its container, and only falls back to `config.height`
   * when the container is shorter than that (or has no definite height of its own to fill - see
   * `PcacChartConfig.heightFull`, where an auto-height container measures ~0 here and the
   * `Math.max` keeps the configured height).
   *
   * Note this deliberately subtracts the margins, so it's the *total* SVG that ends up matching
   * the container: `buildContainer()` adds `margin.top`/`margin.bottom` back on top of `height`
   * when sizing the `<svg>`, so filling without this would overflow the container by exactly the
   * vertical margins.
   * @param container The chart's container element (the `<svg>`'s parent)
   * @param config Chart specific configuration
   */
  private resolveHeight(container: HTMLElement, config: PcacChartConfig): number {
    if (!config.heightFull) {
      return config.height;
    }
    return Math.max(config.height, container.clientHeight - this.margin.top - this.margin.bottom);
  }

  /**
   * True if the container's current raw layout width differs from the one measured by the last
   * successful build, or if no successful build has happened yet. For a `heightFull` chart, a
   * change in the container's height counts too - that's the whole size the chart is tracking.
   *
   * `PcacChartResizeService`'s `ResizeObserver` is guaranteed to fire once as soon as it starts
   * observing — that's what lets a chart recover from the 0-width race described on
   * `initializeChartState`, but it also means that "routine" first callback usually lands
   * moments after `ngOnChanges` already built successfully at the same width. Without this
   * check, that redundant callback would restart the chart's enter transition mid-animation for
   * no visual change. Only `ngOnChanges` (which reacts to data, not size) should skip this check.
   * @param chartElm Reference to SVG on dom
   */
  containerSizeChanged(chartElm: ElementRef): boolean {
    if (this.lastContainerWidth === null) {
      return true;
    }
    const container = chartElm.nativeElement.parentNode as HTMLElement;
    const containerWidth = container.clientWidth;
    if (containerWidth > 0 && containerWidth !== this.lastContainerWidth) {
      return true;
    }
    if (!this.lastHeightFull) {
      return false;
    }
    // Height only matters for a `heightFull` chart, and only there is it safe to compare: the
    // container's height is definite (see `resolveHeight`), so it changes when the *layout*
    // changes, not in response to the height this chart just drew itself at.
    const containerHeight = container.clientHeight;
    return containerHeight > 0 && containerHeight !== this.lastContainerHeight;
  }

  /**
   * 1) Set the width and height of the SVG
   * 2) Add a group and translate it to state of {{center}} option
   * @param chartElm Reference to SVG on dom
   * @param center Are we pinning x,y to the top,left, or are we centering our drawing group inside the SVG.
   */
  buildContainer(chartElm: ElementRef, center = false): void {
    const combinedHeight = this.height + this.margin.top + this.margin.bottom;
    const combinedWidth = this.width + this.margin.left + this.margin.right;
    this.svg = select(chartElm.nativeElement)
      .attr('width', combinedWidth)
      .attr('height', combinedHeight);
    if (center) {
      this.svg = this.svg
        .append('g')
        .attr('transform', 'translate(' + combinedWidth / 2 + ',' + combinedHeight / 2 + ')');
      return;
    }
    this.svg = this.svg
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  /**
   * Most charts share a default margin(s) state.
   * In some cases, that state needs to be calculated based on the content that resides in that margin.
   * For example, labels on a horizontal bar chart are dynamic and such the margin needs to be calculated ahead of
   * chart axis construction.
   * @param chartElm Reference to SVG on dom
   * @param data Generic multi-dimensional PcacData structure
   * @param yScale D3 scale transformation object (d3.ScaleBand)
   */
  setHorizontalMarginsBasedOnContent<Domain extends AxisDomain>(chartElm: ElementRef, data: PcacData[], yScale: AxisScale<Domain>): void {
    const axisY = axisLeft(yScale).ticks(5);
    let max = 0;
    select(chartElm.nativeElement).append('g')
      .call(axisY)
      .each((d, i, n) => {
        const width = (n[i] as SVGGraphicsElement).getBBox().width;
        if (width > max) {
          max = width;
        }
      })
      .remove();
    this.margin.left = max;
    this.width = this.width - this.margin.left;
  }
}
