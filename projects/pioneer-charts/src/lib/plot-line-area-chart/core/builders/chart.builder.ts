import { ElementRef, Injectable, inject } from '@angular/core';
import { select } from 'd3-selection';
import { Line, Area } from 'd3-shape';
import { range } from 'd3-array';
import { Subject } from 'rxjs';

/**
 * Lib
 */
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType, PcacPointImageConfig } from '../../plot-line-area-chart.model';
import { PcacChart } from '../../../core/chart';
import { PcacData } from '../../../core/chart.model';
import { PlaChartScalesBuilder, PlaChartScales } from './scales.builder';
import { getXFormat } from '../x-format';
import { buildLineGenerator } from './line-generator.builder';
import { buildAreaGenerator } from './area-generator.builder';
import { buildZoomBehavior } from './zoom-behavior.builder';

/**
 * Provided per-component (see PcacLineAreaChartComponent's `providers`), not root-scoped: this
 * builder extends PcacChart, which holds mutable per-chart-instance state (margin, width,
 * height, colors, svg). A root singleton would be shared and clobbered by every
 * <pcac-line-area-chart> rendered at once.
 */
@Injectable()
export class PlaChartBuilder extends PcacChart {
  private effectsBuilder = inject(PlaChartEffectsBuilder);
  private scales!: PlaChartScales;
  private lineGenerator!: Line<PcacData>;
  private areaGenerator!: Area<PcacData>;
  private zoomBehavior!: d3.ZoomBehavior<Element, unknown>;
  private dotClickedSource = new Subject<PcacData>();
  private config!: PcacLineAreaChartConfig;
  private clipPathId!: string; // <-- added
  /**
   * How far the clip-path rect extends past the drawable [0, width] x [0, height] area on every
   * side, so a point sitting exactly on the domain's edge isn't cut in half. 10px comfortably
   * clears a dot (r = 4, or 6 on hover); a point image can be much bigger than that, so
   * buildChart() widens this to half the largest image dimension whenever any point has one.
   */
  private clipBuffer = 10;
  private pointImage!: PcacPointImageConfig;
  dotClicked$ = this.dotClickedSource.asObservable();


  buildChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    if (!config?.data?.length) {
      return;
    }

    this.config = JSON.parse(JSON.stringify(config));
    this.startData = range(this.config.data[0].data.length).map((): PcacData => ({
      key: '',
      value: 0,
      hide: false,
      data: []
    }));

    if (this.config.hideAxis) {
      this.config.height = this.config.height + 12;
      this.margin.top = 8;
      this.margin.bottom = 8;
      this.margin.left = 8;
      this.margin.right = 8;
    }

    if (!this.initializeChartState(chartElm, this.config)) {
      return;
    }
    // `?.length`, not a bare truthiness check: PcacLineAreaChartConfig defaults colorOverride to
    // `[]`, and an empty array is truthy - a config built with `new` would otherwise replace the
    // theme palette with nothing and every series would render with no color at all.
    if (this.config.colorOverride?.length) {
      this.colors = this.config.colorOverride;
    }

    this.pointImage = { ...new PcacPointImageConfig(), ...this.config.pointImage };
    this.clipBuffer = this.config.data.some((series) => series.data.some((point) => !!point.image))
      ? Math.max(10, Math.ceil(this.pointImage.maxWidth / 2), Math.ceil(this.pointImage.maxHeight / 2))
      : 10;

    this.scales = new PlaChartScalesBuilder().build(config, this.width, this.height);
    this.lineGenerator = buildLineGenerator(config.xFormat, this.scales);
    this.areaGenerator = buildAreaGenerator(config.xFormat, this.scales, this.height);

    if (this.config.enableZoom) {
      this.zoomBehavior = buildZoomBehavior(this.width, this.height, (event) => {
        // Rescale x
        const newX = event.transform.rescaleX(this.scales.x);

        // Update axis
        this.axisBuilder.drawXAxis({
          svg: this.svg,
          numberOfTicks: this.config.numberOfTicks || 5,
          height: this.height,
          xScale: newX,
          yScale: this.scales.y,
          yFormat: this.config.yFormat,
          xFormat: this.config.xFormat
        });

        // Update lines/areas
        this.svg.selectAll<SVGPathElement, PcacData[]>('.line')
          .attr('d', (d: PcacData[]) => this.lineGenerator.x((_: PcacData, i: number) => newX(i))(d));

        this.svg.selectAll<SVGPathElement, PcacData[]>('.area')
          .attr('d', (d: PcacData[]) => this.areaGenerator.x((_: PcacData, i: number) => newX(i))(d));

        // Update dots / point images. Nested selectAll (not a flat svg.selectAll('.point')) so
        // that `i` is the point's index *within its own series* - the xFormat default
        // (DatasetLength) positions by index, and a flat selection would number every series'
        // points consecutively, shoving the second series' points off to the right on zoom.
        this.svg.selectAll('.dots').selectAll<SVGGElement, PcacData>('.point')
          .attr('transform', (d: PcacData, i: number) => this.pointTransform(d, i, newX));
      });
    }

    this.drawChart(chartElm, this.config, type);
  }

  private drawChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    this.buildContainer(chartElm);
    this.attachZoomBehavior();
    this.createReusableClipPath(); 

    if (!config.hideAxis) {
      this.axisBuilder.drawAxis({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        height: this.height,
        xScale: this.scales.x,
        yScale: this.scales.y,
        yFormat: config.yFormat,
        xFormat: config.xFormat
      });
    }

    if (!config.hideGrid) {
      this.gridBuilder.drawHorizontalGrid({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        width: this.width,
        height: this.height,
        xScale: this.scales.x,
        yScale: this.scales.y
      });
    }

    this.drawLineArea(config, type);

    if (config.enableEffects) {
      this.effectsBuilder.buildEffects({
        svg: this.svg,
        height: this.height,
        width: this.width,
        data: config.data,
        colors: this.colors,
        x: this.scales.x,
        y: this.scales.y
      });
    }

    this.drawDots(config);
  }

  private createReusableClipPath(): void {
    this.clipPathId = `pcac-clip-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.svg.selectAll(`defs #${this.clipPathId}`).remove();
    this.svg.append('defs')
      .append('clipPath')
      .attr('id', this.clipPathId)
      .append('rect')
      // Extend the clip-path past the drawable area on every side so a dot (or point image) at
      // the x-domain's min/max, or the top/bottom of the y range, isn't cut in half. See clipBuffer.
      .attr('x', -this.clipBuffer)
      .attr('y', -this.clipBuffer)
      .attr('width', this.width + this.clipBuffer * 2)
      .attr('height', this.height + this.clipBuffer * 2);
  }

  private attachZoomBehavior(): void {
    if (!this.config.enableZoom) return;

    // Add a transparent rect to capture zoom events
    //
    // d3's `ZoomBehavior<Element, unknown>` vs. our concretely-typed `Selection<SVGRectElement|SVGGElement, ...>`
    // is a known D3+TS typings friction point: `.call()` structurally compares nested generic Selection
    // methods (`.merge()`, `.select()`, ...) and those never line up across two different concrete element
    // types, even though a zoom behavior works on any element at runtime. Narrow, local `any` escape hatch.
    this.svg.insert('rect', ':first-child')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .call(this.zoomBehavior as any)
      .transition()
      .duration(750)

    this.svg.call(this.zoomBehavior as any)
      .transition()
      .duration(750)
  }

  private drawLineArea(config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    for (let i = 0; i < config.data.length; i++) {
      if (type === PcacLineAreaPlotChartConfigType.Area) {
        this.drawArea(config.data[i].data, i);
      } else if (type === PcacLineAreaPlotChartConfigType.Line) {
        this.drawLine(config.data[i].data, i, config.data[i].hide);
      }
    }
  }

  private drawLine(lineData: PcacData[], index: number, hide = false): void {
    this.svg.append('g')
      .attr('class', 'lines')
      .attr('clip-path', `url(#${this.clipPathId})`) // <-- apply clip-path to line group
      .append('path')
      .datum(lineData)
      .attr('class', 'line')
      .attr('d', this.lineGenerator(this.startData))
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('d', this.lineGenerator)
      .attr('stroke', () => {
        return this.colors[index];
      })
      .attr('fill', 'none')
      .attr('style', () => hide ? 'display: none' : null);
  }

  private drawArea(lineData: PcacData[], index: number) {
    this.svg.append('g')
      .attr('class', 'areas')
      .attr('clip-path', `url(#${this.clipPathId})`) // <-- apply clip
      .append('path')
      .datum(lineData)
      .attr('class', 'area')
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
   * Draws one `<g class="dots">` per series holding a `<g class="point">` per data point. The
   * point group carries the x position (as a translate) so that zoom only has to touch that one
   * attribute regardless of what's inside; the child is either the regular `<circle class="dot">`
   * or, when the point has a `PcacData.image`, an `<image class="dot-image">` in its place. Both
   * animate in from the baseline the same way, and the tooltip / click handlers sit on the group
   * so they behave identically for either.
   */
  private drawDots(config: PcacLineAreaChartConfig): void {
    const self = this;
    const duration = this.transitionService.getTransitionDuration();
    const { maxWidth, maxHeight } = this.pointImage;

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
        .attr('transform', (d: PcacData, i: number) => this.pointTransform(d, i, this.scales.x))
        .on('mouseover', function (this: SVGGElement, event: MouseEvent, d: PcacData) {
          self.tooltipBuilder.showBarTooltip(event, d, self.config.yFormat, self.config.xFormat);
          // No-op for an image point (no circle inside to grow).
          select(this).select('.dot')
            .transition()
            .duration(duration / 3)
            .attr('r', 6)
            .attr('fill', self.colors[index]);
        })
        .on('mouseout', function (this: SVGGElement) {
          self.tooltipBuilder.hideTooltip();
          select(this).select('.dot')
            .transition()
            .duration(duration / 3)
            .attr('r', 4)
            .attr('fill', '#fff');
        })
        .on('click', (_event: MouseEvent, d: PcacData) => {
          this.dotClickedSource.next(d);
        });

      points.filter((d: PcacData) => !d.image)
        .append('circle')
        .attr('class', 'dot')
        .attr('stroke', this.colors[index])
        .attr('cy', this.scales.y(0))
        .attr('fill', '#fff')
        .transition()
        .duration(duration)
        .attr('cy', (d: PcacData) => this.scales.y(d.value as number))
        .attr('r', 4);

      // `preserveAspectRatio="xMidYMid meet"` is what does the "resize to fit" - the image is
      // scaled uniformly to fit inside the maxWidth x maxHeight box and centered within it, so
      // a non-square image still lands centered on the point. x/y offset by half the box so the
      // box (not its top-left corner) is centered on the data point, matching where a dot sits.
      points.filter((d: PcacData) => !!d.image)
        .append('image')
        .attr('class', 'dot-image')
        .attr('href', (d: PcacData) => d.image as string)
        .attr('width', maxWidth)
        .attr('height', maxHeight)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('x', -maxWidth / 2)
        .attr('y', this.scales.y(0) - maxHeight / 2)
        .transition()
        .duration(duration)
        .attr('y', (d: PcacData) => this.scales.y(d.value as number) - maxHeight / 2);
    }
  }

  private pointTransform(d: PcacData, i: number, xScale: PlaChartScales['x']): string {
    return `translate(${getXFormat(this.config.xFormat, d, i, xScale)}, 0)`;
  }
}
