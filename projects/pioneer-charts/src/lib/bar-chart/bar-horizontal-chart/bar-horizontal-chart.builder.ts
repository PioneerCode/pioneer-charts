import { Injectable, ElementRef } from '@angular/core';
import { color } from 'd3-color';
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { BaseType } from 'd3-selection';
// Side effect only: adds .transition() to d3-selection's Selection, which the bar animations use.
import 'd3-transition';
import { Subject } from 'rxjs';

/**
 * Lib
 */
import { PcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { PcacChart } from '../../core/chart';
import { PcacData } from '../../core/chart.model';
import { barSizes, stackStarts } from '../../core/stack';
import { barThreshold, barThresholdLayout, groupThreshold } from '../bar-thresholds';
import { seriesKeys } from '../bar-series';

// `BaseType` (not the hand-rolled union this used to be, which omitted `null` and never
// actually matched what `.selectAll()`'s default generics resolve to).
type GroupType = Selection<BaseType, PcacData, BaseType, PcacData>;

/**
 * Provided per-component (see PcacBarHorizontalChartComponent's `providers`), not root-scoped:
 * this builder extends PcacChart, which holds mutable per-chart-instance state (margin, width,
 * height, colors, svg). A root singleton would be shared and clobbered by every
 * <pcac-bar-horizontal-chart> rendered at once.
 */
@Injectable()
export class BarHorizontalChartBuilder extends PcacChart {
  private xScale!: ScaleLinear<number, number>;
  private yScaleStacked!: ScaleBand<string>;
  private yScaleGrouped!: ScaleBand<string>;
  private barClickedSource = new Subject<PcacData>();
  barClicked$ = this.barClickedSource.asObservable();

  protected override chartTypeLabel = 'Bar chart';

  buildChart(chartElm: ElementRef, config: PcacBarHorizontalChartConfig): void {
    if (!config?.data?.length) {
      this.clearChart(chartElm);
      return;
    }

    // Shallow copy, as the vertical chart does: initializeAxisState() rewrites `height`, which
    // must not land on the consumer's config - but the data stays the consumer's own objects, so
    // `barClicked` and the tooltip hand back the very `PcacData` they passed in. (A JSON deep copy
    // used to hand back clones, which never matched the consumer's data by identity.)
    config = { ...config };
    this.initializeAxisState(config, 'x');
    if (!this.initializeChartState(chartElm, config)) {
      return;
    }

    this.ensureColorCount(seriesKeys(config.data).length);
    this.applyColorOverride(config.colorOverride?.colors);
    this.buildScales(chartElm, config);
    this.drawChart(chartElm, config);
  }

  private buildScales(chartElm: ElementRef, config: PcacBarHorizontalChartConfig) {
    // Bars grow from 0, so only `domainMax` is read; `xAxis.domainMin` is ignored.
    this.xScale = scaleLinear()
      .domain([0, this.xAxis.domainMax as number]);


    this.yScaleStacked = scaleBand()
      .domain(config.data.map((d) => d.key as string))
      .range([this.height, 0])
      .padding(0.1);

    this.yScaleGrouped = scaleBand()
      .padding(0.05)
      .rangeRound([0, this.yScaleStacked.bandwidth()])
      .domain(seriesKeys(config.data));

    // The left margin is sized to the y axis's labels - unless there is no y axis to size it to
    if (!this.yAxis.hide) {
      this.setHorizontalMarginsBasedOnContent(chartElm, this.yScaleStacked);
    }

    this.xScale.range([0, this.width]);
  }

  private drawChart(chartElm: ElementRef, config: PcacBarHorizontalChartConfig): void {
    this.buildContainer(chartElm);
    this.axisBuilder.drawAxis(this.axisBuilderConfig(this.xScale, this.yScaleStacked));
    this.drawGrids(this.xScale, this.yScaleStacked);
    this.addGroups(config);
    this.axisBuilder.raiseAxes(this.svg);
  }

  private addGroups(config: PcacBarHorizontalChartConfig) {
    const groupsContainer = this.svg.append('g')
      .attr('class', 'pcac-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pcac-bar-group')
      .attr('data-group-id', (d: PcacData, i: number) => {
        return i;
      })
      .attr('transform', (d: PcacData) => 'translate(0,' + this.yScaleStacked(d.key as string) + ')');

    const group = groupsContainer.selectAll('rect')
      .data((d: PcacData) => {
        return d.data ?? [];
      });

    this.drawBarsPerGroup(group, config);

    switch (barThresholdLayout(config.thresholds, config.isStacked)) {
      case 'chart':
        this.drawThresholdAcrossChart(config);
        break;
      case 'group':
        this.drawThresholdsPerGroup(config);
        break;
      case 'bar':
        this.drawThresholdsPerBarInGroup(group, config);
        break;
    }
  }

  private drawBarsPerGroup(groups: GroupType, config: PcacBarHorizontalChartConfig) {
    const self = this;
    // Stacked bars start where the previous bar in their group ends; every other layout draws
    // from the baseline (start 0).
    // Sizes honor `hide` (and treat a null or non-numeric value as 0), so a hidden bar keeps its
    // slot and color but draws nothing - see `barSizes`.
    const sizes = barSizes(config.data);
    const starts = config.isStacked ? stackStarts(config.data, sizes) : new Map<PcacData, number>();
    const startOf = (d: PcacData) => starts.get(d) ?? 0;
    const endOf = (d: PcacData) => startOf(d) + (sizes.get(d) ?? 0);
    // Colored by series - the bar's key's place among every group's keys, the same slot it's drawn
    // in - rather than by its position in its own group, which differs when groups hold different
    // series. With `spreadColorsPerGroup`, by group instead.
    const keys = seriesKeys(config.data);
    const fillOf = (d: PcacData, bar: SVGRectElement) => config.spreadColorsPerGroup
      ? this.colors[Number((bar.parentNode as Element).getAttribute('data-group-id'))]
      : this.colors[keys.indexOf(d.key as string)];
    groups.enter().append('rect')
      .attr('class', 'pcac-bar')
      .attr('x', (d: PcacData) => this.xScale(startOf(d)))
      // A stacked bar spans its whole group, which is already translated into place; looking its
      // series key up in the group band put it off in another group's slot whenever the key
      // matched a group key.
      .attr('y', (d: PcacData) => config.isStacked ? 0 : this.yScaleGrouped(d.key as string) ?? 0)
      .attr('data-group-bar-id', (_: PcacData, i: number) => {
        return i;
      })
      .attr('height', !config.isStacked ? this.yScaleGrouped.bandwidth() : this.yScaleStacked.bandwidth())
      .style('fill', function (this: SVGRectElement, d: PcacData) {
        return fillOf(d, this);
      })
      .attr('width', 0)
      // The hover fades run as their own named transition: an unnamed one would cancel the enter
      // transition still growing the bar, leaving it part-grown until the next rebuild.
      .on('mouseover', function (this: SVGRectElement, _event: MouseEvent, d: PcacData) {
        const fill = fillOf(d, this);
        select(this)
          .transition('hover')
          .duration(self.transitionService.getTransitionDuration() / 5)
          .style('fill', color(fill)?.darker(1).toString() ?? fill);
      })
      .on('mousemove', function (this: SVGRectElement, event: MouseEvent, d: PcacData) {
        const groupIndex = Number((this.parentNode as Element).getAttribute('data-group-id'));
        const index = Number(this.getAttribute('data-group-bar-id'));
        self.showTooltip(event, d, { index, parent: config.data[groupIndex], parentIndex: groupIndex, valueFormat: self.xAxis.format });
      })
      .on('mouseout', function (this: SVGRectElement, _event: MouseEvent, d: PcacData) {
        self.hideTooltip();
        select(this)
          .transition('hover')
          .duration(self.transitionService.getTransitionDuration() / 5)
          .style('fill', fillOf(d, this));
      })
      .on('click', (_event: MouseEvent, d: PcacData) => {
        this.barClickedSource.next(d);
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('width', (d: PcacData) => {
        return this.xScale(endOf(d)) - this.xScale(startOf(d));
      });
  }

  private drawThresholdAcrossChart(config: PcacBarHorizontalChartConfig) {
    const threshold = groupThreshold(config.thresholds, 0);
    if (!threshold) {
      return;
    }
    this.applyPreTransitionThresholdStyles(this.svg.select('.pcac-bars').append('rect'))
      .attr('height', this.height)
      .attr('data-group-threshold-id', 0)
      .on('mousemove', (event: MouseEvent) => {
        this.showTooltip(event, threshold, { index: 0, isThreshold: true, valueFormat: this.xAxis.format });
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('x', this.xScale(Number(threshold.value)));
  }

  /** One threshold across each group that has one; groups without an entry are skipped. */
  private drawThresholdsPerGroup(config: PcacBarHorizontalChartConfig) {
    const self = this;
    const groupIndexOf = (rect: Element) => Number((rect.parentElement as HTMLElement).dataset['groupId']);
    const groups = this.svg.selectAll<SVGGElement, PcacData>('.pcac-bar-group')
      .filter((_: PcacData, i: number) => groupThreshold(config.thresholds, i) !== null);
    this.applyPreTransitionThresholdStyles(groups.append('rect'))
      .attr('height', this.yScaleStacked.bandwidth())
      .attr('data-group-threshold-id', function (this: SVGRectElement) {
        return groupIndexOf(this);
      })
      .on('mousemove', function (this: SVGRectElement, event: MouseEvent) {
        const index = groupIndexOf(this);
        // A threshold's own PcacData is typically just a value, so its parent is the *data* group
        // it's drawn against (which has the key) rather than the threshold entry it came from.
        self.showTooltip(
          event,
          groupThreshold(config.thresholds, index) as PcacData,
          { index, parent: config.data[index], parentIndex: index, isThreshold: true, valueFormat: self.xAxis.format }
        );
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('x', (_: unknown, i: number, nodes: ArrayLike<Element>) => {
        return this.xScale(Number(groupThreshold(config.thresholds, groupIndexOf(nodes[i]))?.value));
      });
  }

  /** One threshold across each bar that has one; bars without an entry are skipped. */
  private drawThresholdsPerBarInGroup(group: GroupType, config: PcacBarHorizontalChartConfig) {
    const self = this;
    const thresholdOf = (rect: Element) => barThreshold(
      config.thresholds,
      Number((rect.parentElement as HTMLElement).dataset['groupId']),
      Number(rect.getAttribute('data-group-threshold-id')),
    );
    const rects = this.applyPreTransitionThresholdStyles(group.enter().append('rect'))
      .attr('data-group-threshold-id', (_: PcacData, i: number) => {
        return i;
      })
      .attr('height', this.yScaleGrouped.bandwidth());
    rects.filter(function (this: SVGRectElement) {
      return thresholdOf(this) === null;
    }).remove();
    rects.filter(function (this: SVGRectElement) {
      return thresholdOf(this) !== null;
    })
      .on('mousemove', function (this: SVGRectElement, event: MouseEvent) {
        const index = Number(this.getAttribute('data-group-threshold-id'));
        const groupIndex = Number((this.parentElement as HTMLElement).dataset['groupId']);
        // Parent is the data group (see drawThresholdsPerGroup), not the threshold entry itself.
        self.showTooltip(
          event,
          thresholdOf(this) as PcacData,
          { index, parent: config.data[groupIndex], parentIndex: groupIndex, isThreshold: true, valueFormat: self.xAxis.format }
        );
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('y', (d: PcacData) => {
        // ScaleBand can return undefined for a key outside its domain; `.attr()` needs null, not undefined.
        return this.yScaleGrouped(d.key as string) ?? null;
      })
      .attr('x', (_: PcacData, i: number, nodes: ArrayLike<Element>) => {
        return this.xScale(Number(thresholdOf(nodes[i])?.value));
      });
  }

  private applyPreTransitionThresholdStyles<S extends Selection<any, any, any, any>>(elm: S): S {
    return elm.attr('class', 'pcac-threshold')
      .style('fill', () => {
        return this.colorService.getAlert();
      })
      .style('stroke', () => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', () => {
        return 2;
      })
      .attr('width', '3px')
      .on('mouseout', () => {
        this.hideTooltip();
      });
  }
}
