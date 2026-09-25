import { axisLeft, AxisDomain, AxisScale } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
import { IPcacAxisBuilderConfig, PcacAxisBuilder } from './axis.builder';
import { PcacGridBuilder } from './grid.builder';
import { PcacColorService } from './color.service';
import { select } from 'd3-selection';
import { ElementRef, Injectable, OnDestroy, TemplateRef, inject } from '@angular/core';
import { PCAC_AXIS_LABEL_SPACE, PCAC_AXIS_SUB_LABEL_SPACE, PcacAxisChartConfig, PcacChartConfig, PcacChartMargin, PcacData, PcacFormatEnum, PcacResolvedAxisConfig, axisLabelSpace, resolveAxisConfig } from './chart.model';
import { PcacTransitionService } from './transition.service';
import { PcacTooltipBuilder } from './tooltip.builder';
import { PcacTooltipCoincident, PcacTooltipContext } from './tooltip.directive';

/**
 * Everything `showTooltip()` needs beyond the hovered datum itself. `parent`/`isThreshold` feed
 * the consumer template's context; the formats only apply to the default (no template) content.
 */
export interface PcacTooltipOptions {
  /** See `PcacTooltipContext.index`. Required so no hover site can forget to supply it. */
  index: number;
  parent?: PcacData | null;
  /** See `PcacTooltipContext.parentIndex`. Defaults to `null`, matching `parent`'s default. */
  parentIndex?: number | null;
  isThreshold?: boolean;
  /** See `PcacTooltipContext.coincident`. Defaults to none. */
  coincident?: PcacTooltipCoincident[];
  valueFormat?: PcacFormatEnum;
  keyFormat?: PcacFormatEnum;
  /**
   * The element the tooltip is placed beside instead of above the cursor: off one of its corners,
   * whichever fits in the viewport (see `PcacTooltipBuilder.positionBeside`), so it never covers it.
   */
  anchor?: Element | null;
}


// Decorated only so Angular accepts its `ngOnDestroy` hook, which the builders extending it inherit;
// never provided itself - each builder is provided by its own chart component.
@Injectable()
export class PcacChart implements OnDestroy {
  axisBuilder = inject(PcacAxisBuilder);
  gridBuilder = inject(PcacGridBuilder);
  transitionService = inject(PcacTransitionService);
  tooltipBuilder = inject(PcacTooltipBuilder);
  colorService = inject(PcacColorService);

  /** D3's own `tickSizeInner` default, which the default `margin` below is sized around. */
  static readonly DEFAULT_TICK_SIZE = 6;

  /** See `PCAC_AXIS_LABEL_SPACE` / `PCAC_AXIS_SUB_LABEL_SPACE` in chart.model.ts. */
  static readonly AXIS_LABEL_SPACE = PCAC_AXIS_LABEL_SPACE;
  static readonly AXIS_SUB_LABEL_SPACE = PCAC_AXIS_SUB_LABEL_SPACE;

  margin: PcacChartMargin = { top: 8, right: 16, bottom: 20, left: 40 };
  private readonly defaultMargin: PcacChartMargin = { ...this.margin };

  /**
   * The current build's per-axis settings with defaults applied, set by `initializeAxisState()`.
   * Builders read these (not the raw `config.xAxis`) everywhere: drawing the axes, choosing
   * whether to draw a grid, how many grid lines, and so on. Pie has no axes and never sets them.
   */
  xAxis: PcacResolvedAxisConfig = resolveAxisConfig();
  yAxis: PcacResolvedAxisConfig = resolveAxisConfig();
  svg!: Selection<SVGGElement, unknown, BaseType, unknown>;
  width = 400;
  height = 400;
  colors = [] as string[];
  startData: PcacData[] = [];

  /**
   * Swaps a consumer's `colorOverride` in for the theme palette `initializeChartState` set, in
   * order. Checks `length` rather than truthiness: every config class defaults its override to
   * `[]`, and an empty array is truthy - taken as an override, it would leave every mark with no
   * color. Cycled out to at least as many entries as the theme palette, the same way that palette
   * cycles its own colors, so an override shorter than the data repeats rather than leaving the
   * marks past its end with an `undefined` color. Call after `initializeChartState()`.
   */
  protected applyColorOverride(override: readonly string[] | undefined): void {
    if (!override?.length) {
      return;
    }
    this.colors = Array.from(
      { length: Math.max(this.colors.length, override.length) },
      (_, i) => override[i % override.length],
    );
  }

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
   * How much the vertical margins have grown this build beyond their defaults - for tick marks
   * and axis labels (`initializeAxisState()`; negative when a short tick took some away) and for
   * content that hangs past the plot's edge (`reserveEdgeSpace()`). `resolveHeight()` subtracts
   * it from the plot height so the SVG's total height doesn't change with any of them. Reset
   * alongside the margins.
   */
  private reservedHeight = 0;

  /**
   * Resolves the consumer's projected `<ng-template pcacTooltip>`, if any. Each chart component
   * points this at its own `contentChild(PcacTooltipDirective)` query. It's a getter rather than
   * a captured value so it's read lazily, at hover time, from inside a D3 listener: reading the
   * query signal in the component's build effect instead would make the effect depend on it and
   * rebuild the whole chart (restarting its entry animation) whenever the query resolves.
   */
  tooltipTemplate: () => TemplateRef<PcacTooltipContext> | undefined = () => undefined;

  /**
   * Puts `margin` back to its defaults. `initializeAxisState()` calls this first thing, before any
   * per-build adjustment (hidden axes giving sides back, tick sizes growing them, label widths
   * measured into `margin.left`): `margin` lives on this per-chart instance and so persists
   * between builds, and without a reset an adjustment made for one config silently carries into
   * the next - e.g. axes drawn with no room after `hide` flips back to false.
   */
  resetMargin(): void {
    this.margin = { ...this.defaultMargin };
    this.reservedHeight = 0;
  }

  /**
   * Resolves the config's `xAxis`/`yAxis` onto this chart and sets the margins up for them. Axis
   * charts call this at the top of `buildChart()`, on their own copy of the config (it rewrites
   * `config.height` for hidden axes), before `initializeChartState()` measures the plot area.
   * In order:
   *
   * 1. `resetMargin()`.
   * 2. Tick marks: room for a non-default `tickSize` is reserved on each axis that will actually
   *    be drawn (`reserveTickSizeMargins`).
   * 3. Labels: `AXIS_LABEL_SPACE` is added to `bottom` / `left` for an axis with a `label`, and
   *    `AXIS_SUB_LABEL_SPACE` for one with any `subLabels` (see `axisLabelSpace`), again only if
   *    the axis will be drawn.
   * 4. Hidden axes: an axis with `hide` gives its margins back to the plot. The y axis owns
   *    `left` and `top` (the top margin is only there so the topmost y label isn't clipped), the
   *    x axis `bottom` and `right` (likewise for the rightmost x label). Each reclaimed vertical
   *    margin is added onto `config.height` so the SVG's total height stays what the consumer
   *    configured; horizontally `initializeChartState()` picks the change up on its own.
   *
   * @param defaultGrid the axis whose grid this chart draws when the consumer hasn't said
   * (`PcacAxisConfig.showGrid`): `'y'` for horizontal lines, `'x'` for vertical.
   * @param hiddenAxisMargin what a hidden axis's sides shrink to, rather than 0. The
   * line/area/plot charts keep 8px so a dot on the edge of the plot isn't clipped by the SVG.
   */
  initializeAxisState(config: PcacAxisChartConfig, defaultGrid: 'x' | 'y', hiddenAxisMargin = 0): void {
    this.xAxis = resolveAxisConfig(config.xAxis, defaultGrid === 'x');
    this.yAxis = resolveAxisConfig(config.yAxis, defaultGrid === 'y');
    this.resetMargin();
    this.reserveTickSizeMargins(
      this.xAxis.hide ? undefined : this.xAxis.tickSize,
      this.yAxis.hide ? undefined : this.yAxis.tickSize
    );
    if (!this.xAxis.hide) {
      const space = axisLabelSpace(this.xAxis);
      this.margin.bottom += space;
      this.reservedHeight += space;
    }
    if (!this.yAxis.hide) {
      this.margin.left += axisLabelSpace(this.yAxis);
    }
    if (this.yAxis.hide) {
      config.height = config.height + this.margin.top - hiddenAxisMargin;
      this.margin.top = hiddenAxisMargin;
      this.margin.left = hiddenAxisMargin;
    }
    if (this.xAxis.hide) {
      config.height = config.height + this.margin.bottom - hiddenAxisMargin;
      this.margin.bottom = hiddenAxisMargin;
      this.margin.right = hiddenAxisMargin;
    }
  }

  /**
   * The `PcacAxisBuilder` config for this chart's current state - everything but the scales is
   * already on the instance. Builders pass the result to `drawAxis()` (or `drawXAxis()` with a
   * rescaled x, on zoom).
   */
  axisBuilderConfig<XDomain extends AxisDomain, YDomain extends AxisDomain>(
    xScale: AxisScale<XDomain>, yScale: AxisScale<YDomain>
  ): IPcacAxisBuilderConfig<XDomain, YDomain> {
    return {
      svg: this.svg,
      width: this.width,
      height: this.height,
      margin: this.margin,
      xScale,
      yScale,
      xAxis: this.xAxis,
      yAxis: this.yAxis
    };
  }

  /**
   * Draws whichever grids the resolved axes ask for: vertical lines from the x axis's ticks,
   * horizontal from the y's (`PcacAxisConfig.showGrid`). `which` restricts it to one axis - the
   * line/area/plot charts redraw just a zoomed axis's grid against its rescaled scale on zoom.
   */
  drawGrids<XDomain extends AxisDomain, YDomain extends AxisDomain>(
    xScale: AxisScale<XDomain>, yScale: AxisScale<YDomain>, which: 'x' | 'y' | 'both' = 'both'
  ): void {
    const base = { svg: this.svg, width: this.width, height: this.height, xScale, yScale };
    if (which !== 'y' && this.xAxis.showGrid) {
      this.gridBuilder.drawVerticalGrid({ ...base, numberOfTicks: this.xAxis.ticks, color: this.xAxis.gridColor });
    }
    if (which !== 'x' && this.yAxis.showGrid) {
      this.gridBuilder.drawHorizontalGrid({ ...base, numberOfTicks: this.yAxis.ticks, color: this.yAxis.gridColor });
    }
  }

  /**
   * Makes room in the margins for tick marks longer (or shorter) than D3's default. The default
   * margins are sized around that default (`DEFAULT_TICK_SIZE`), and D3 places each tick label at
   * tick length + padding, so a longer tick pushes its labels outward by exactly the difference -
   * into space the margin doesn't have unless it grows by the same amount. Growing the margin here,
   * *before* `initializeChartState()` measures the plot area, is what makes the chart shrink to fit
   * its labels rather than pushing them off the edge of the SVG. A shorter tick hands the
   * difference back to the plot area the same way.
   *
   * Horizontally that happens on its own: `initializeChartState()` derives `width` from the
   * container minus the margins. Vertically it doesn't - `config.height` is the plot area, and
   * the SVG is that plus the margins - so a taller bottom margin would grow the SVG instead. The
   * delta is therefore also remembered in `reservedHeight` and taken back out of the plot
   * height by `resolveHeight()`, keeping the chart's total footprint where the consumer put it.
   *
   * Called by `initializeAxisState()` right after `resetMargin()`, for the axes that will be
   * drawn. Only the axis a tick size is given for is affected; `undefined` leaves that margin
   * alone.
   * @param xTickSize `tickSizeInner` for the bottom (x) axis, which lives in `margin.bottom`
   * @param yTickSize `tickSizeInner` for the left (y) axis, which lives in `margin.left`
   */
  reserveTickSizeMargins(xTickSize?: number, yTickSize?: number): void {
    if (xTickSize !== undefined) {
      const bottom = Math.max(0, this.margin.bottom + xTickSize - PcacChart.DEFAULT_TICK_SIZE);
      this.reservedHeight = bottom - this.margin.bottom;
      this.margin.bottom = bottom;
    }
    if (yTickSize !== undefined) {
      this.margin.left = Math.max(0, this.margin.left + yTickSize - PcacChart.DEFAULT_TICK_SIZE);
    }
  }

  /**
   * Makes sure each given margin is at least that big, for content drawn at the very edge of the
   * plot area that reaches past it - a point image on the line/area/plot charts, say, whose box
   * is centered on a point at the top of the y domain and so hangs half of itself above the plot.
   * Those charts already widen their clip-path to let such a point through; this is what stops
   * the `<svg>` itself from cutting it off, the SVG being only the plot area plus the margins.
   *
   * "At least", not "add": the default margins, and any tick / label room already reserved in
   * them, may well cover it already (`margin.left` is 40 by default), and adding on top of that
   * would give up plot area for nothing. Vertical growth is taken out of the plot height the same
   * way `reserveTickSizeMargins()`'s is, so the SVG's total height stays what the consumer
   * configured; horizontally `initializeChartState()` picks the change up on its own. A side
   * left `undefined` is untouched.
   *
   * Call after `initializeAxisState()` (which resets the margins) and before
   * `initializeChartState()` (which measures the plot area against them).
   */
  reserveEdgeSpace(space: Partial<PcacChartMargin>): void {
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      const wanted = space[side];
      if (wanted === undefined || wanted <= this.margin[side]) {
        continue;
      }
      if (side === 'top' || side === 'bottom') {
        this.reservedHeight += wanted - this.margin[side];
      }
      this.margin[side] = wanted;
    }
  }

  /**
   * Shows the tooltip for a hovered datum, through the chart's `pcacTooltip` template when one is
   * projected and the default key/value content otherwise. Every builder's hover handler should
   * go through here rather than `tooltipBuilder` directly so the template is honored everywhere.
   */
  showTooltip(event: MouseEvent, data: PcacData, options: PcacTooltipOptions): void {
    this.tooltipBuilder.showTooltip(
      event,
      this.tooltipTemplate(),
      {
        $implicit: data,
        parent: options.parent ?? null,
        isThreshold: options.isThreshold ?? false,
        index: options.index,
        parentIndex: options.parentIndex ?? null,
        coincident: options.coincident ?? [],
      },
      options.valueFormat,
      options.keyFormat,
      options.anchor,
      this
    );
  }

  /** Hides the tooltip if this chart is the one showing it; another chart's is left alone. */
  hideTooltip(): void {
    this.tooltipBuilder.hideTooltip(this);
  }

  /**
   * Builders are provided per chart component, so Angular calls this when the component is
   * destroyed. A chart removed while hovered (an `@if` flip, a route change) gets no `mouseout`,
   * so without this its tooltip - and any consumer template view in it - would stay on screen.
   */
  ngOnDestroy(): void {
    this.hideTooltip();
  }

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
  /**
   * Removes whatever the chart last drew, for a build with no data to draw. Builders call it
   * rather than just returning, which left the previous data on screen when a consumer emptied
   * the chart (e.g. a filter that now matches nothing).
   */
  clearChart(chartElm: ElementRef): void {
    this.hideTooltip();
    select(chartElm.nativeElement).select('g').remove();
  }

  initializeChartState(chartElm: ElementRef, config: PcacChartConfig): boolean {
    // The rebuild removes the hovered element, which gets no mouseout to close its tooltip.
    this.hideTooltip();
    select(chartElm.nativeElement).select('g').remove();
    const container = chartElm.nativeElement.parentNode as HTMLElement;
    const containerWidth = container.clientWidth;
    const measuredWidth = containerWidth - this.margin.left - this.margin.right;
    if (measuredWidth <= 0) {
      // The previous drawing was just removed above, so nothing is on screen any more. Forget the
      // size it was drawn at, or a container that comes back at that same width (a hidden tab
      // shown again) would read as unchanged to `containerSizeChanged()` and never be redrawn.
      this.lastContainerWidth = null;
      return false;
    }
    this.width = measuredWidth;
    this.height = this.resolveHeight(container, config);
    // One color per group or per series within a group, whichever needs more - sized by the
    // largest group, since bars index colors by their position within their own group.
    this.colors = this.colorService.getColorScale(
      Math.max(config.data.length, ...config.data.map((d) => d.data?.length ?? 0)),
    );
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
    // See `reserveTickSizeMargins()` / `reserveEdgeSpace()`: room made in the vertical margins
    // comes out of the plot area, not added on to the SVG. Applies to the floor in the `heightFull`
    // case too, for the same reason.
    const height = Math.max(0, config.height - this.reservedHeight);
    if (!config.heightFull) {
      return height;
    }
    return Math.max(height, container.clientHeight - this.margin.top - this.margin.bottom);
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
   *
   * Measures with the y axis's own `tickSize` (the measured box spans the tick line as well as
   * the label, so measuring at a different length would put the labels off by the difference)
   * and adds its `axisLabelSpace()` back on top, since the measurement replaces whatever
   * `initializeAxisState()` reserved for the label / sub labels.
   * @param chartElm Reference to SVG on dom
   * @param yScale D3 scale transformation object (d3.ScaleBand)
   */
  setHorizontalMarginsBasedOnContent<Domain extends AxisDomain>(chartElm: ElementRef, yScale: AxisScale<Domain>): void {
    const axisY = axisLeft(yScale).ticks(5);
    if (this.yAxis.tickSize !== undefined) {
      axisY.tickSizeInner(this.yAxis.tickSize);
    }
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
    // `width` was already computed net of the current `margin.left` by initializeChartState(),
    // so only the *change* in margin comes out of it. Subtracting the whole measured margin
    // double-counted it, and since `margin` persists on the builder between builds, the amount
    // double-counted grew on the next rebuild - the plot area came out narrower than the
    // container allowed and then shrank further after the first resize.
    const left = max + axisLabelSpace(this.yAxis);
    this.width = this.width + this.margin.left - left;
    this.margin.left = left;
  }
}
