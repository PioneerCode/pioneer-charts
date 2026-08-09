import { axisLeft } from 'd3-axis';
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


export class PcacChart {
  axisBuilder = inject(PcacAxisBuilder);
  gridBuilder = inject(PcacGridBuilder);
  transitionService = inject(PcacTransitionService);
  tooltipBuilder = inject(PcacTooltipBuilder);
  colorService = inject(PcacColorService);

  margin = { top: 8, right: 16, bottom: 20, left: 40 };
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
    const containerWidth = chartElm.nativeElement.parentNode.clientWidth;
    this.width = containerWidth - this.margin.left - this.margin.right;
    if (this.width <= 0) {
      return false;
    }
    this.height = config.height;
    this.colors = this.colorService.getColorScale(Math.max(config.data.length, config.data[0]?.data ? config.data[0].data.length : 0));
    this.lastContainerWidth = containerWidth;
    return true;
  }

  /**
   * True if the container's current raw layout width differs from the one measured by the last
   * successful build, or if no successful build has happened yet.
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
    const containerWidth = chartElm.nativeElement.parentNode.clientWidth;
    return containerWidth > 0 && containerWidth !== this.lastContainerWidth;
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
  setHorizontalMarginsBasedOnContent(chartElm: ElementRef, data: PcacData[], yScale: any): void {
    const axisY = axisLeft(yScale).ticks(5);
    let max = 0;
    select(chartElm.nativeElement).append('g')
      .call(axisY)
      .each((d, i, n: any) => {
        if (n[i].getBBox().width > max) {
          max = n[i].getBBox().width;
        }
      })
      .remove();
    this.margin.left = max;
    this.margin.bottom = this.margin.bottom;
    this.width = this.width - this.margin.left;
  }
}
