import { ElementRef, Injectable, inject } from '@angular/core';
import { select, Selection } from 'd3-selection';
import { Line, Area } from 'd3-shape';
import { range } from 'd3-array';
import { ZoomBehavior } from 'd3-zoom';
// Side effect only: adds .transition() to d3-selection's Selection, which the entry animations use.
import 'd3-transition';
import { Subject } from 'rxjs';

/**
 * Lib
 */
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType, PcacPointImageConfig, PcacPointRangeConfig } from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig, PcacPointFanOutConfig } from '../../plot/plot.model';
import { PcacChart } from '../../../core/chart';
import { PcacData } from '../../../core/chart.model';
import { PcacTooltipCoincident } from '../../../core/tooltip.directive';
import { PlaChartScalesBuilder, PlaChartScales, longestSeriesLength } from './scales.builder';
import { getXFormat } from '../x-format';
import { buildLineGenerator } from './line-generator.builder';
import { buildAreaGenerator } from './area-generator.builder';
import { buildZoomBehavior } from './zoom-behavior.builder';
import { drawRange, rangeExtent } from './point-range.builder';
import { PlaCoincidentGroup, PlaCoincidentPoint, PlaPoint, PlaPointOffset, fanOutOffsets, fanOutRadius, fanOutShift, findCoincidentGroups } from './fan-out.builder';

/**
 * Provided per-component (see PcacLineAreaChartComponent's `providers`), not root-scoped: this
 * builder extends PcacChart, which holds mutable per-chart-instance state (margin, width,
 * height, colors, svg). A root singleton would be shared and clobbered by every
 * <pcac-line-area-chart> rendered at once.
 */
/** Half the theme's 2px line stroke: how far the lines/areas/fan-outs clip-path reaches past the plot. */
const PLOT_CLIP_ALLOWANCE = 1;

/**
 * Names for the dot's transitions. d3 lets only one transition *per name* run on an element: a
 * new one cancels the old. The enter rise (`cy`) keeps the default name; the hover grow/shrink
 * and the entry's size-in (`r`) each get their own, so hovering a dot while the chart is still
 * animating in no longer cancels its rise and strands it short of its value. Hover interrupts
 * the size-in explicitly instead, since both tween `r`.
 */
const DOT_GROW_TRANSITION = 'pcac-dot-grow';
const DOT_HOVER_TRANSITION = 'pcac-dot-hover';
/** See `revealAfterEntry`. */
const REVEAL_TRANSITION = 'pcac-reveal';

/** Each chart type's accessible name when its config gives no `ariaLabel`. */
const CHART_TYPE_LABELS: Record<PcacLineAreaPlotChartConfigType, string> = {
  [PcacLineAreaPlotChartConfigType.Line]: 'Line chart',
  [PcacLineAreaPlotChartConfigType.Area]: 'Area chart',
  [PcacLineAreaPlotChartConfigType.Plot]: 'Plot chart',
};

@Injectable()
export class PlaChartBuilder extends PcacChart {
  private effectsBuilder = inject(PlaChartEffectsBuilder);
  private scales!: PlaChartScales;
  private lineGenerator!: Line<PcacData>;
  private areaGenerator!: Area<PcacData>;
  private zoomBehavior!: ZoomBehavior<Element, unknown>;
  private dotClickedSource = new Subject<PcacData>();
  private config!: PcacLineAreaChartConfig;
  private clipPathId!: string; // <-- added
  /**
   * A second clip-path for everything that isn't a point - lines, areas, fan-out anchors and
   * spokes: the plot area plus `PLOT_CLIP_ALLOWANCE`. These have no business past the axes; the
   * points' buffer below used to apply to them too, so a line chart with big point images had
   * its lines run on half an image past the axes once zoomed.
   */
  private plotClipPathId!: string;
  /**
   * How far the points' clip-path rect extends past the drawable [0, width] x [0, height] area on
   * every side, so a point sitting exactly on the domain's edge isn't cut in half. 10px
   * comfortably clears a dot (r = 4, or 6 on hover); a point image can be much bigger than that,
   * so buildChart() widens this to half the largest image dimension whenever any point has one
   * (and grows the margins to match - see `reservePointSpace()` - since the clip-path only
   * matters up to the edge of the SVG). The buffer is only there for points whose center is
   * inside the plot; one whose center zoom has carried past an edge is hidden outright (see
   * `pointVisible`), rather than left showing up to a whole half-mark beyond the axis.
   */
  private clipBuffer = 10;
  private pointImage!: PcacPointImageConfig;
  /**
   * Points that share a coordinate, found by `resolvePointLayout()`. `coincidentOf` looks a
   * point's group up for its tooltip and for its ring's shift (see `fanOutShift`); `fanOutOffsets`
   * only matters when `fanOut` is on (plot chart with `pointFanOut`) and is where each member sits
   * on its ring relative to the shared coordinate, before that shift.
   */
  private coincidentGroups: PlaCoincidentGroup[] = [];
  private coincidentOf = new Map<PcacData, PlaCoincidentGroup>();
  private fanOut: PcacPointFanOutConfig | null = null;
  private fanOutOffsets = new Map<PcacData, PlaPointOffset>();
  /** The `.point` group under the cursor, between its mouseover and mouseout (see `leavePoint`). */
  private hoveredPoint: SVGGElement | null = null;
  /** `config.pointRange` with its defaults applied, or `null` while ranges are off. */
  private pointRange: PcacPointRangeConfig | null = null;
  /** Each drawn range's `.point-range` group, by its point, so hover can find the one to focus. */
  private rangeGroupOf = new Map<PcacData, SVGGElement>();
  /**
   * Whether this build has the hover crosshair: `enableEffects`, on a line or area chart. A plot
   * chart has no line for it to follow, so it gets none - its circles had nowhere to go and sat
   * stacked in the plot's top-left corner.
   */
  private effectsEnabled = false;
  dotClicked$ = this.dotClickedSource.asObservable();


  buildChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    if (!config?.data?.length) {
      this.leavePoint();
      this.clearChart(chartElm);
      return;
    }

    // A rebuild throws the hovered point away with everything else, and a removed element gets
    // no mouseout, so its tooltip is closed here (see `leavePoint`).
    this.leavePoint();
    this.config = JSON.parse(JSON.stringify(config));
    this.startData = range(longestSeriesLength(this.config.data)).map((): PcacData => ({
      key: '',
      value: 0,
      hide: false,
      data: []
    }));

    // A hidden axis keeps 8px rather than 0 so a dot on the edge of the plot isn't clipped
    this.initializeAxisState(this.config, 'y', 8);
    this.chartTypeLabel = CHART_TYPE_LABELS[type];
    this.resolvePointLayout(type);
    this.reservePointSpace();
    this.pointRange = this.config.pointRange ? { ...new PcacPointRangeConfig(), ...this.config.pointRange } : null;

    if (!this.initializeChartState(chartElm, this.config)) {
      return;
    }
    this.applyColorOverride(this.config.colorOverride);

    this.scales = new PlaChartScalesBuilder().build(this.xAxis, this.yAxis, this.config.data, this.width, this.height);
    this.lineGenerator = buildLineGenerator(this.xAxis.format, this.scales);
    this.areaGenerator = buildAreaGenerator(this.xAxis.format, this.scales, this.height);

    if (this.zoomEnabled) {
      this.zoomBehavior = buildZoomBehavior(this.width, this.height, (event) => {
        // Zoom moves the points, not the mouse: the hovered one slides out from under a still
        // cursor (or is hidden outright, see `pointDisplay`), and either way the browser never
        // sends it a mouseout - its tooltip would stay up, and its dot stay grown, until the
        // cursor happened to cross it again. So the hover is ended here, on every zoom event.
        this.leavePoint();

        // A d3 zoom transform is always two-dimensional; only the enabled axes follow it and the
        // other keeps its original scale, so that component of the gesture is simply ignored.
        const newX = this.config.enableZoomX ? event.transform.rescaleX(this.scales.x) : this.scales.x;
        const newY = this.config.enableZoomY ? event.transform.rescaleY(this.scales.y) : this.scales.y;
        const zoomedScales: PlaChartScales = { x: newX, y: newY };

        // Update the zoomed axes, each with its grid: the grid hangs off the axis's ticks, so it
        // is redrawn against the rescaled scale and dropped back underneath everything (append
        // puts it on top).
        if (this.config.enableZoomX) {
          this.axisBuilder.drawXAxis(this.axisBuilderConfig(newX, newY));
          this.svg.selectAll('.pcac-grid-vertical').remove();
          this.drawGrids(newX, newY, 'x');
        }
        if (this.config.enableZoomY) {
          this.axisBuilder.drawYAxis(this.axisBuilderConfig(newX, newY));
          this.svg.selectAll('.pcac-grid-horizontal').remove();
          this.drawGrids(newX, newY, 'y');
        }
        this.svg.selectAll('.pcac-grid').lower();

        // Update lines/areas. Fresh generators against the rescaled scales, so they go through
        // the same getXFormat() as the dots below - positioning by bare index here (which this
        // used to do, and which also overwrote the original generators' x accessor for good) is
        // only right for the default DatasetLength format; a DateTime/Decimal chart's lines
        // drifted away from its dots as soon as it was zoomed.
        // Interrupted first: a zoom during the enter transition would otherwise have the rest of
        // that transition keep drawing the unzoomed shape over this one.
        const zoomedLine = buildLineGenerator(this.xAxis.format, zoomedScales);
        const zoomedArea = buildAreaGenerator(this.xAxis.format, zoomedScales, this.height);
        this.svg.selectAll<SVGPathElement, PcacData[]>('.line').interrupt().attr('d', (d: PcacData[]) => zoomedLine(d));
        this.svg.selectAll<SVGPathElement, PcacData[]>('.area').interrupt().attr('d', (d: PcacData[]) => zoomedArea(d));

        // Update dots / point images. Nested selectAll (not a flat svg.selectAll('.point')) so
        // that `i` is the point's index *within its own series* - the x format default
        // (DatasetLength) positions by index, and a flat selection would number every series'
        // points consecutively, shoving the second series' points off to the right on zoom.
        this.svg.selectAll('.dots').selectAll<SVGGElement, PcacData>('.point')
          .attr('transform', (d: PcacData, i: number) => this.pointTransform(d, i, zoomedScales))
          .attr('display', (d: PcacData, i: number) => this.pointDisplay(d, i, zoomedScales));
        // A fan-out's anchor is positioned like the points it belongs to, so it moves the same way;
        // its spokes are re-aimed because the ring's shift back into the plot (`fanOutShift`)
        // depends on where the anchor now is.
        this.svg.selectAll<SVGGElement, PlaCoincidentGroup>('.fan-out')
          .attr('transform', (g: PlaCoincidentGroup) => this.fanOutTransform(g, zoomedScales))
          .selectAll<SVGLineElement, PlaCoincidentPoint>('.fan-out-spoke')
          .attr('x2', (member: PlaCoincidentPoint) => this.spokeEnd(member, zoomedScales).dx)
          .attr('y2', (member: PlaCoincidentPoint) => this.spokeEnd(member, zoomedScales).dy);

        // The hover crosshair positions and labels against the scales, so it takes the zoomed ones.
        if (this.effectsEnabled) {
          this.effectsBuilder.updateScales(newX, newY);
        }

        // Ranges are drawn in plot coordinates rather than hung off a translate, so every one is
        // redrawn against the zoomed scales.
        this.updatePointRanges(zoomedScales);

        // Redrawing an axis appends it at the end of the group, above the dots; put them back
        // on top so a point on the baseline isn't covered (see drawChart's draw order).
        this.svg.selectAll('.point-ranges').raise();
        this.svg.selectAll('.fan-outs').raise();
        this.svg.selectAll('.dots').raise();
      });
    }

    this.drawChart(chartElm, this.config, type);
  }

  private drawChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    this.buildContainer(chartElm);
    this.attachZoomBehavior();
    this.createReusableClipPath(); 

    this.axisBuilder.drawAxis(this.axisBuilderConfig(this.scales.x, this.scales.y));

    this.drawGrids(this.scales.x, this.scales.y);

    this.drawLineArea(config, type);

    this.effectsEnabled = !!config.enableEffects && type !== PcacLineAreaPlotChartConfigType.Plot;
    if (this.effectsEnabled) {
      this.effectsBuilder.buildEffects({
        svg: this.svg,
        height: this.height,
        width: this.width,
        data: config.data,
        colors: this.colors,
        x: this.scales.x,
        y: this.scales.y,
        xFormat: this.xAxis.format,
        yFormat: this.yAxis.format,
        yTicks: this.yAxis.ticks,
      });
    }

    // Axes above the lines/areas (so an axis line isn't covered by a series sitting at x = 0),
    // but the dots above the axes: a point on the baseline or the y axis stays whole. Fan-out
    // spokes go between the two so they run underneath the points they lead to, and point
    // ranges under those.
    this.axisBuilder.raiseAxes(this.svg);
    this.drawPointRanges();
    this.drawFanOuts();
    this.drawDots(config);
  }

  /**
   * Resolves `pointImage`, finds the points that share a coordinate and, on a plot chart with
   * `pointFanOut`, works out where to draw each of them instead. Coincidence is found from the
   * data (see `findCoincidentGroups`) so this can run before the scales exist. Line and area
   * charts still get the groups, for the tooltip's `coincident` list, but never an offset.
   */
  private resolvePointLayout(type: PcacLineAreaPlotChartConfigType): void {
    this.pointImage = { ...new PcacPointImageConfig(), ...this.config.pointImage };
    this.coincidentGroups = findCoincidentGroups(this.config.data, this.xAxis.format);
    this.coincidentOf = new Map(
      this.coincidentGroups.flatMap((group) => group.members.map((member) => [member.data, group] as const))
    );

    const fanOut = type === PcacLineAreaPlotChartConfigType.Plot
      ? (this.config as PcacPlotChartConfig).pointFanOut
      : undefined;
    if (!fanOut) {
      this.fanOut = null;
      this.fanOutOffsets = new Map();
      return;
    }
    this.fanOut = { ...new PcacPointFanOutConfig(), ...fanOut };
    // A group's members are kept apart by the size of what's drawn for them: the image box when
    // any member has an image, else a hovered dot (r = 6).
    const { maxWidth, maxHeight } = this.pointImage;
    const markSize = (group: PlaCoincidentGroup) =>
      group.members.some((member) => !!member.data.image) ? Math.max(maxWidth, maxHeight) : 12;
    const radius = (group: PlaCoincidentGroup) =>
      this.fanOut!.radius ?? fanOutRadius(group.members.length, markSize(group), this.fanOut!.gap);
    this.fanOutOffsets = fanOutOffsets(this.coincidentGroups, radius);
  }

  /**
   * When any point has an `image`, makes room for it at the edge of the domain: the clip-path
   * buffer grows to half the box so the `.dots` group lets it through, and the margins grow to at
   * least that same amount so the `<svg>` doesn't cut off what the clip-path let through (an image
   * box is centered on its point, so at the top of the y domain half of it sits above the plot
   * area - in `margin.top`, which is only 8px by default). Half the box is all a fan-out needs
   * too: a fanned-out ring is shifted back inside the plot area (`fanOutShift`), so no member's
   * center ever sits past the edge either. Must run after `resolvePointLayout()` and between
   * `initializeAxisState()` and `initializeChartState()`, see `reserveEdgeSpace`.
   */
  private reservePointSpace(): void {
    const hasImages = this.config.data.some((series) => series.data.some((point) => !!point.image));
    if (!hasImages) {
      this.clipBuffer = 10;
      return;
    }
    const halfWidth = Math.ceil(this.pointImage.maxWidth / 2);
    const halfHeight = Math.ceil(this.pointImage.maxHeight / 2);
    this.clipBuffer = Math.max(10, halfWidth, halfHeight);
    this.reserveEdgeSpace({ top: halfHeight, bottom: halfHeight, left: halfWidth, right: halfWidth });
  }

  private createReusableClipPath(): void {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.clipPathId = `pcac-clip-${stamp}`;
    this.plotClipPathId = `pcac-clip-plot-${stamp}`;
    this.svg.selectAll(`defs #${this.clipPathId}, defs #${this.plotClipPathId}`).remove();
    const defs = this.svg.append('defs');
    defs.append('clipPath')
      .attr('id', this.clipPathId)
      .append('rect')
      // Extend the clip-path past the drawable area on every side so a dot (or point image) at
      // the x-domain's min/max, or the top/bottom of the y range, isn't cut in half. See clipBuffer.
      .attr('x', -this.clipBuffer)
      .attr('y', -this.clipBuffer)
      .attr('width', this.width + this.clipBuffer * 2)
      .attr('height', this.height + this.clipBuffer * 2);
    // Lines, areas and the fan-out anchors and spokes get the plot area itself, give or take a
    // stroke: a line along the domain's max keeps its full width rather than being halved at
    // the edge, but nothing runs on into the points' buffer - a spoke to a member that zoom has
    // carried out of the plot (and hidden, see `pointVisible`) stops at the axis.
    defs.append('clipPath')
      .attr('id', this.plotClipPathId)
      .append('rect')
      .attr('x', -PLOT_CLIP_ALLOWANCE)
      .attr('y', -PLOT_CLIP_ALLOWANCE)
      .attr('width', this.width + PLOT_CLIP_ALLOWANCE * 2)
      .attr('height', this.height + PLOT_CLIP_ALLOWANCE * 2);
  }

  private get zoomEnabled(): boolean {
    return !!(this.config.enableZoomX || this.config.enableZoomY);
  }

  private attachZoomBehavior(): void {
    if (!this.zoomEnabled) return;

    // A transparent rect so the empty plot area is a hit target too: a `<g>` has no area of its
    // own, so wheel/drag only reaches it through something painted. The rect is only ever that -
    // the behavior is attached once, to the group, and the rect's events bubble up to it. It used
    // to be `.call()`ed on both, and d3-zoom keeps its transform per element (`__zoom`): a wheel
    // over a point never passes through the rect (a sibling of the `.dots`, not an ancestor), so
    // only the group's transform advanced, and once the point had slid out from under the cursor
    // the next tick hit the rect - whose handler redrew from its own stale, near-identity
    // transform before the group's redrew from the real one, every tick, flickering the chart
    // between the two.
    //
    // d3's `ZoomBehavior<Element, unknown>` vs. our concretely-typed `Selection<SVGGElement, ...>`
    // is a known D3+TS typings friction point: `.call()` structurally compares nested generic Selection
    // methods (`.merge()`, `.select()`, ...) and those never line up across two different concrete element
    // types, even though a zoom behavior works on any element at runtime. Narrow, local `any` escape hatch.
    this.svg.insert('rect', ':first-child')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    this.svg.call(this.zoomBehavior as any);
  }

  private drawLineArea(config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    for (let i = 0; i < config.data.length; i++) {
      if (type === PcacLineAreaPlotChartConfigType.Area) {
        this.drawArea(config.data[i].data, i, config.data[i].hide);
      } else if (type === PcacLineAreaPlotChartConfigType.Line) {
        this.drawLine(config.data[i].data, i, config.data[i].hide);
      }
    }
  }

  private drawLine(lineData: PcacData[], index: number, hide = false): void {
    this.svg.append('g')
      .attr('class', 'lines')
      .attr('clip-path', `url(#${this.plotClipPathId})`)
      .append('path')
      .datum(lineData)
      .attr('class', 'line')
      // Set up front rather than on the transition, so a zoom interrupting it (see the zoom
      // handler) doesn't leave the line uncolored, or a hidden one showing.
      .attr('stroke', this.colors[index])
      .attr('fill', 'none')
      .attr('style', hide ? 'display: none' : null)
      .attr('d', this.lineGenerator(this.startData))
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('d', this.lineGenerator);
  }

  private drawArea(lineData: PcacData[], index: number, hide = false) {
    this.svg.append('g')
      .attr('class', 'areas')
      .attr('clip-path', `url(#${this.plotClipPathId})`)
      .append('path')
      .datum(lineData)
      .attr('class', 'area')
      // Same `hide` handling as drawLine()/drawDots(); the area used to ignore it and paint
      // a hidden series' fill anyway.
      .style('display', () => hide ? 'none' : null)
      .style('opacity', 0.5)
      .style('fill', () => {
        return this.colors[index];
      })
      .attr('d', this.areaGenerator(this.startData))
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('d', this.areaGenerator);
  }

  /**
   * Draws one `<g class="point-ranges">` holding a group per series and, inside it, a
   * `<g class="point-range">` per point that has a `range` - only while `pointRange` is on. Clipped
   * to the plot area and deaf to the pointer, so it never gets in the way of hover or zoom. When
   * each range shows is entirely the theme's business, driven by classes: `pcac-range-<show>` on
   * the outer group sets the resting opacity, and hover (`focusPointRange`) marks the hovered
   * point's range `is-focused` and the outer group `has-focus`. The colors are custom properties
   * - the series' own on its group, `color` (when set) on the outer one, which wins - see
   * plot-line-area-chart.component.scss.
   */
  private drawPointRanges(): void {
    this.rangeGroupOf = new Map();
    if (!this.pointRange) {
      return;
    }
    const { show, faintOpacity, color } = this.pointRange;
    const layer = this.svg.append('g')
      .attr('class', `point-ranges pcac-range-${show}`)
      .attr('clip-path', `url(#${this.plotClipPathId})`)
      .attr('pointer-events', 'none')
      .style('--pcac-point-range-color', () => color ?? null)
      .style('--pcac-point-range-faint-opacity', () => faintOpacity);

    this.config.data.forEach((series, seriesIndex) => {
      const seriesGroup = layer.append('g')
        .attr('class', 'point-range-series')
        .style('--pcac-point-range-series-color', () => this.colors[seriesIndex])
        .style('display', () => series.hide ? 'none' : null);
      series.data.forEach((point) => {
        if (point.range) {
          this.rangeGroupOf.set(point, seriesGroup.append('g').attr('class', 'point-range').node()!);
        }
      });
    });
    this.updatePointRanges(this.scales);
    this.revealAfterEntry(layer);
  }

  /**
   * Draws every range against `scales`, around its point's true coordinate - a fanned-out point's
   * range stays on the anchor, not on the ring. A range with nothing placeable is left empty.
   */
  private updatePointRanges(scales: PlaChartScales): void {
    if (!this.pointRange) {
      return;
    }
    const style = this.pointRange.style;
    this.config.data.forEach((series, seriesIndex) => {
      series.data.forEach((point, index) => {
        const node = this.rangeGroupOf.get(point);
        if (!node) {
          return;
        }
        const group = select(node);
        const { x, y } = this.pointPosition(point, index, scales);
        const extent = rangeExtent(point, x, y, this.xAxis.format, scales);
        if (!extent) {
          group.selectAll('*').remove();
          return;
        }
        drawRange(group, extent, style, `${this.plotClipPathId}-range-${seriesIndex}-${index}`);
      });
    });
  }

  /** Brings `d`'s range forward (see `drawPointRanges`), or with `null` puts every range back to rest. */
  private focusPointRange(d: PcacData | null): void {
    if (!this.pointRange || !this.svg) {
      return;
    }
    this.svg.selectAll('.point-range.is-focused').classed('is-focused', false);
    const node = d ? this.rangeGroupOf.get(d) : undefined;
    if (node) {
      select(node).classed('is-focused', true);
    }
    this.svg.select('.point-ranges').classed('has-focus', !!node);
  }

  /**
   * Draws one `<g class="fan-outs">` holding a `<g class="fan-out">` per group of coincident
   * points: a spoke from the shared coordinate to where each member is drawn, and an anchor dot
   * on the coordinate itself. Only when the fan-out is on and asks for anchors. The group sits on
   * the true coordinate (unlike a point group, which also carries its ring's shift - see
   * `pointTransform`), so zoom moves it the same way and everything inside is relative to the
   * coordinate; each spoke ends where its member is actually drawn, ring offset plus shift. It
   * fades in over the points' own entry transition. `spokeColor` / `anchorColor` go on the outer
   * group as custom properties for the theme's `.fan-out-spoke` / `.fan-out-anchor` rules (see
   * the axis builder's `applyColors`).
   */
  private drawFanOuts(): void {
    if (!this.fanOut?.showAnchor || this.coincidentGroups.length === 0) {
      return;
    }
    const { spokeColor, anchorColor } = this.fanOut;
    const groups = this.svg.append('g')
      .attr('class', 'fan-outs')
      .attr('clip-path', `url(#${this.plotClipPathId})`)
      .style('--pcac-fan-out-spoke-color', () => spokeColor ?? null)
      .style('--pcac-fan-out-anchor-color', () => anchorColor ?? null)
      .selectAll('.fan-out')
      .data(this.coincidentGroups)
      .enter().append('g')
      .attr('class', 'fan-out')
      .attr('transform', (group: PlaCoincidentGroup) => this.fanOutTransform(group, this.scales));

    groups.selectAll('.fan-out-spoke')
      .data((group: PlaCoincidentGroup) => group.members)
      .enter().append('line')
      .attr('class', 'fan-out-spoke')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (member: PlaCoincidentPoint) => this.spokeEnd(member, this.scales).dx)
      .attr('y2', (member: PlaCoincidentPoint) => this.spokeEnd(member, this.scales).dy);

    groups.append('circle')
      .attr('class', 'fan-out-anchor')
      .attr('r', 3);

    this.revealAfterEntry(groups);
  }

  /**
   * Keeps `selection` hidden while the points rise in from the baseline, then fades it in. For
   * the guides drawn around the points (fan-out spokes and anchors, point ranges): they're drawn
   * where the points end up, so showing them during the rise has them pointing at empty space.
   * Its own transition name so that nothing else animating the same element cancels it.
   */
  private revealAfterEntry(selection: Selection<any, any, any, any>): void {
    const duration = this.transitionService.getTransitionDuration();
    selection.attr('opacity', 0)
      .transition(REVEAL_TRANSITION)
      .delay(duration)
      .duration(duration / 3)
      .attr('opacity', 1);
  }

  /**
   * Draws one `<g class="dots">` per series holding a `<g class="point">` per data point. The
   * point group carries the position (as a translate) so that zoom, on either axis, only has to
   * touch that one attribute regardless of what's inside; the child is either the regular
   * `<circle class="dot">` or, when the point has a `PcacData.image`, an `<image class="dot-image">`
   * in its place, and sits at the group's origin. Both animate in from the baseline the same way
   * - the start is the baseline expressed relative to the point, since the group is already on
   * the point - and the tooltip / click handlers sit on the group so they behave identically for
   * either. A fanned-out point's ring offset is applied to the child, inside the group, so it too
   * is untouched by zoom; only its ring's shift back into the plot area, which depends on where
   * the coordinate is, rides along in the group's translate (see `pointTransform`).
   */
  private drawDots(config: PcacLineAreaChartConfig): void {
    const self = this;
    const duration = this.transitionService.getTransitionDuration();
    const { maxWidth, maxHeight } = this.pointImage;
    const rise = (d: PcacData) => this.scales.y(0) - this.scales.y(d.value as number);

    for (let index = 0; index < config.data.length; index++) {
      const series = config.data[index];
      const points = this.svg.append('g')
        .attr('class', 'dots')
        .attr('clip-path', `url(#${this.clipPathId})`) // <-- apply clip
        .attr('style', series.hide ? 'display: none' : null)
        .selectAll('.point')
        .data(series.data)
        .enter().append('g')
        .attr('class', 'point')
        .attr('transform', (d: PcacData, i: number) => this.pointTransform(d, i, this.scales))
        .attr('display', (d: PcacData, i: number) => this.pointDisplay(d, i, this.scales))
        .on('mouseover', function (this: SVGGElement, event: MouseEvent, d: PcacData) {
          self.hoveredPoint = this;
          self.focusPointRange(d);
          // `d` is the very element bound from `series.data` above, so identity lookup is exact.
          self.showTooltip(event, d, {
            index: series.data.indexOf(d),
            parent: series,
            parentIndex: index,
            coincident: self.coincidentWith(d),
            valueFormat: self.yAxis.format,
            keyFormat: self.xAxis.format,
            // The dot or image itself rather than the group, so the tooltip clears what's drawn.
            anchor: select(this).select('.dot, .dot-image').node() as Element | null,
          });
          // No-op for an image point (no circle inside to grow). Its own transition name, so it
          // runs alongside the enter rise rather than cancelling it (see DOT_HOVER_TRANSITION);
          // it only takes over the entry's size tween, which it would otherwise fight over `r`.
          select(this).select('.dot')
            .interrupt(DOT_GROW_TRANSITION)
            .transition(DOT_HOVER_TRANSITION)
            .duration(duration / 3)
            .attr('r', 6)
            .attr('fill', self.colors[index]);
        })
        .on('mouseout', () => this.leavePoint())
        .on('click', (_event: MouseEvent, d: PcacData) => {
          this.dotClickedSource.next(d);
        });

      points.filter((d: PcacData) => !d.image)
        .append('circle')
        .attr('class', 'dot')
        .attr('stroke', this.colors[index])
        .attr('cx', (d: PcacData) => this.offsetOf(d).dx)
        .attr('cy', rise)
        .attr('fill', '#fff')
        .call((dots) => dots.transition()
          .duration(duration)
          .attr('cy', (d: PcacData) => this.offsetOf(d).dy))
        .transition(DOT_GROW_TRANSITION)
        .duration(duration)
        .attr('r', 4);

      // `preserveAspectRatio="xMidYMid meet"` is what does the "resize to fit" - the image is
      // scaled uniformly to fit inside the maxWidth x maxHeight box and centered within it, so
      // a non-square image still lands centered on the point. x/y offset by half the box so the
      // box (not its top-left corner) is centered on the point group's origin, matching where a
      // dot sits.
      points.filter((d: PcacData) => !!d.image)
        .append('image')
        .attr('class', 'dot-image')
        .attr('href', (d: PcacData) => d.image as string)
        .attr('width', maxWidth)
        .attr('height', maxHeight)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('x', (d: PcacData) => -maxWidth / 2 + this.offsetOf(d).dx)
        .attr('y', (d: PcacData) => rise(d) - maxHeight / 2)
        .transition()
        .duration(duration)
        .attr('y', (d: PcacData) => -maxHeight / 2 + this.offsetOf(d).dy);
    }
  }

  /**
   * Ends the current hover, if there is one: hides the tooltip and shrinks the dot back. Shared by
   * the point's own mouseout and the zoom handler, which has to end a hover the browser won't
   * (the point moves, the cursor doesn't - see `buildChart`'s zoom callback).
   */
  private leavePoint(): void {
    if (!this.hoveredPoint) {
      return;
    }
    const point = this.hoveredPoint;
    this.hoveredPoint = null;
    this.hideTooltip();
    this.focusPointRange(null);
    select(point).select('.dot')
      .interrupt(DOT_GROW_TRANSITION)
      .transition(DOT_HOVER_TRANSITION)
      .duration(this.transitionService.getTransitionDuration() / 3)
      .attr('r', 4)
      .attr('fill', '#fff');
  }

  /**
   * Where a point's group goes: its true coordinate, plus - for a fanned-out point - however far
   * its ring had to be shifted to stay inside the plot area at these scales. The shift is on the
   * group rather than the child because it changes as zoom moves the coordinate (the ring offset,
   * on the child, doesn't), and this is the one attribute zoom already updates.
   */
  private pointTransform(d: PcacData, i: number, scales: PlaChartScales): string {
    const { x, y } = this.pointPlacement(d, i, scales);
    return `translate(${x}, ${y})`;
  }

  /**
   * The `display` of a point's group at these scales: shown while its center is inside the plot
   * area, `none` once zoom has carried it past an edge. Together with the clip-path's buffer this
   * is what bounds how far a mark may hang over an axis: a point on the edge is drawn whole, half
   * of it outside the plot, and that half is the most that ever shows - the alternative, letting
   * the clip-path's buffer do the work, showed a point up to a whole half-mark beyond the axis
   * with its center already outside. Also takes it out of hover's reach, as a hidden group
   * receives no pointer events.
   */
  private pointDisplay(d: PcacData, i: number, scales: PlaChartScales): string | null {
    return this.pointVisible(d, i, scales) ? null : 'none';
  }

  private pointVisible(d: PcacData, i: number, scales: PlaChartScales): boolean {
    const { x, y } = this.markCenter(d, i, scales);
    // A hair of slack, so a point on the domain's edge isn't lost to a rescaled scale landing on
    // -0.0000001 instead of 0.
    const slack = 0.5;
    return x >= -slack && x <= this.width + slack && y >= -slack && y <= this.height + slack;
  }

  /** Where the point's group is drawn: its coordinate plus its ring's shift, if it's fanned out. */
  private pointPlacement(d: PcacData, i: number, scales: PlaChartScales): PlaPoint {
    const { x, y } = this.pointPosition(d, i, scales);
    const shift = this.shiftOf(d, scales);
    return { x: x + shift.dx, y: y + shift.dy };
  }

  /** Where the mark itself is centered: the group's placement plus the ring offset on the child. */
  private markCenter(d: PcacData, i: number, scales: PlaChartScales): PlaPoint {
    const { x, y } = this.pointPlacement(d, i, scales);
    const offset = this.offsetOf(d);
    return { x: x + offset.dx, y: y + offset.dy };
  }

  /** A fan-out sits on its members' true coordinate, with no shift applied; any member locates it. */
  private fanOutTransform(group: PlaCoincidentGroup, scales: PlaChartScales): string {
    const { data, index } = group.members[0];
    const { x, y } = this.pointPosition(data, index, scales);
    return `translate(${x}, ${y})`;
  }

  private pointPosition(d: PcacData, i: number, scales: PlaChartScales): PlaPoint {
    return { x: getXFormat(this.xAxis.format, d, i, scales.x), y: scales.y(d.value as number) };
  }

  /** A member's ring offset from the shared coordinate, `0` for a point that isn't fanned out. */
  private offsetOf(d: PcacData): PlaPointOffset {
    return this.fanOutOffsets.get(d) ?? { dx: 0, dy: 0 };
  }

  /** How far `d`'s ring is moved back into the plot area at these scales (see `fanOutShift`). */
  private shiftOf(d: PcacData, scales: PlaChartScales): PlaPointOffset {
    const group = this.coincidentOf.get(d);
    if (!group || !this.fanOutOffsets.has(d)) {
      return { dx: 0, dy: 0 };
    }
    const { data, index } = group.members[0];
    const offsets = group.members.map((member) => this.offsetOf(member.data));
    return fanOutShift(this.pointPosition(data, index, scales), offsets, { width: this.width, height: this.height });
  }

  /** Where a spoke ends, relative to its anchor: where the member is drawn, ring offset plus shift. */
  private spokeEnd(member: PlaCoincidentPoint, scales: PlaChartScales): PlaPointOffset {
    const offset = this.offsetOf(member.data);
    const shift = this.shiftOf(member.data, scales);
    return { dx: offset.dx + shift.dx, dy: offset.dy + shift.dy };
  }

  /** The other points at `d`'s coordinate, for the tooltip context (see `PcacTooltipContext.coincident`). */
  private coincidentWith(d: PcacData): PcacTooltipCoincident[] {
    const group = this.coincidentOf.get(d);
    if (!group) {
      return [];
    }
    return group.members
      .filter((member) => member.data !== d)
      .map((member) => ({ data: member.data, parent: member.series, index: member.index, parentIndex: member.seriesIndex }));
  }
}
