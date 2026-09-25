import { Injectable, ElementRef } from '@angular/core';

import { select, Selection, BaseType } from 'd3-selection';
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { color } from 'd3-color';
// Imported for its side effect only: this is what adds .transition() to d3-selection's
// Selection prototype, which this builder leans on throughout.
import 'd3-transition';

/**
 * Lib
 */
import { PcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { PcacChart } from '../../core/chart';
import { PcacData } from '../../core/chart.model';
import { barSizes, stackStarts } from '../../core/stack';
import { barThreshold, barThresholdLayout, groupThreshold } from '../bar-thresholds';
import { seriesKeys } from '../bar-series';

import { Subject } from 'rxjs';

// `BaseType` (not the hand-rolled union this used to be, which omitted `null` and never
// actually matched what `.selectAll()`'s default generics resolve to).
type GroupType = Selection<BaseType, PcacData, BaseType, PcacData>;

/**
 * Provided per-component (see PcacBarVerticalChartComponent's `providers`), not root-scoped:
 * this builder extends PcacChart, which holds mutable per-chart-instance state (margin, width,
 * height, colors, svg). A root singleton would be shared and clobbered by every
 * <pcac-bar-vertical-chart> rendered at once.
 */
@Injectable()
export class BarVerticalChartBuilder extends PcacChart {
  private xScaleStacked!: ScaleBand<string>;
  private xScaleGrouped!: ScaleBand<string>;
  private yScale!: ScaleLinear<number, number>;
  private barClickedSource = new Subject<PcacData>();
  barClicked$ = this.barClickedSource.asObservable();



  buildChart(chartElm: ElementRef, config: PcacBarVerticalChartConfig): void {
    if (!config?.data?.length) {
      this.clearChart(chartElm);
      return;
    }

    // Shallow copy: initializeAxisState() rewrites `height` for hidden axes, and that must not
    // land on the consumer's own config object (it previously did, growing it by the margins on
    // first build).
    config = { ...config };
    this.initializeAxisState(config, 'y');
    if (!this.initializeChartState(chartElm, config)) {
      return;
    }

    // Copy before reversing: `.reverse()` is in place, and this is the consumer's own array -
    // reversing it directly flipped their palette on every rebuild (i.e. every resize).
    if (config.colorOverride && config.colorOverride.colors) {
      this.colors = [...config.colorOverride.colors].reverse();
    }
    this.buildScales(config);
    this.drawChart(chartElm, config);
  }

  private buildScales(config: PcacBarVerticalChartConfig) {
    // `this.height`, not `config.height`: with `heightFull` on they differ (see
    // PcacChart.resolveHeight), and the axis, grid and bar baselines all use the resolved one.
    // Bars grow from 0, so only `domainMax` is read; `yAxis.domainMin` is ignored.
    this.yScale = scaleLinear()
      .rangeRound([0, this.height])
      .domain([this.yAxis.domainMax as number, 0]);

    this.xScaleStacked = scaleBand()
      .domain(config.data.map((d) => d.key as string))
      .rangeRound([0, this.width])
      .padding(0.1);

    this.xScaleGrouped = scaleBand()
      .padding(0.2)
      .rangeRound([0, this.xScaleStacked.bandwidth()])
      .domain(seriesKeys(config.data));
  }

  private drawChart(chartElm: ElementRef, config: PcacBarVerticalChartConfig): void {
    this.buildContainer(chartElm);
    this.axisBuilder.drawAxis(this.axisBuilderConfig(this.xScaleStacked, this.yScale));
    this.drawGrids(this.xScaleStacked, this.yScale);
    this.addGroups(config);
    this.axisBuilder.raiseAxes(this.svg);
  }

  private addGroups(config: PcacBarVerticalChartConfig) {
    const groupsContainer = this.svg.append('g')
      .attr('class', 'pcac-bars')
      .selectAll('g')
      .data(config.data)
      .enter().append('g')
      .attr('class', 'pcac-bar-group')
      .attr('data-group-id', (d: PcacData, i: number) => {
        return i;
      })
      .attr('transform', (d: PcacData) => {
        return 'translate(' + this.xScaleStacked(d.key as string) + ',0)';
      });

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

  private drawBarsPerGroup(group: GroupType, config: PcacBarVerticalChartConfig) {
    const self = this;
    // Stacked bars sit on top of the ones before them in their group; every other layout draws
    // from the baseline (start 0).
    // Sizes honor `hide` (and treat a null or non-numeric value as 0), so a hidden bar keeps its
    // slot and color but draws nothing - see `barSizes`.
    const sizes = barSizes(config.data);
    const starts = config.isStacked ? stackStarts(config.data, sizes) : new Map<PcacData, number>();
    const startOf = (d: PcacData) => starts.get(d) ?? 0;
    const endOf = (d: PcacData) => startOf(d) + (sizes.get(d) ?? 0);
    group.enter().append('rect')
      .attr('class', 'pcac-bar')
      .attr('x', (d: PcacData) => {
        const value = !config.isStacked ? this.xScaleGrouped(d.key as string) : this.xScaleStacked(d.key as string)
        return value ? value : 0;
      })
      .attr('data-group-bar-id', (_: PcacData, i: number) => {
        return i;
      })
      .style('fill', (d: PcacData, i: number, n: any) => {
        if (config.spreadColorsPerGroup) {
          const groupIndex = parseInt(n[0].parentNode.getAttribute('data-group-id'), 10);
          return this.colors[groupIndex];
        }
        return this.colors[i];
      })
      .attr('y', () => {
        return this.height;
      })
      .attr('height', 0)
      .on('mouseover', function (this: any) {
        select(this)
          .transition()
          .duration(self.transitionService.getTransitionDuration() / 5)
          .style('fill', () => {
            if (config.spreadColorsPerGroup) {
              const groupIndex = parseInt(this.parentNode.getAttribute('data-group-id'), 10);
              const c = color(self.colors[groupIndex])
              const ct = c ? c.darker(1).toString() : self.colors[groupIndex]
              return ct
            }
            const groupIndex = parseInt(this.getAttribute('data-group-bar-id'), 10);
            const c = color(self.colors[groupIndex])
            const ct = c ? c.darker(1).toString() : self.colors[groupIndex]
            return ct
          });
      })
      .on('mousemove', function (this: SVGRectElement, event: MouseEvent, d: PcacData) {
        const groupIndex = Number((this.parentNode as Element).getAttribute('data-group-id'));
        const index = Number(this.getAttribute('data-group-bar-id'));
        self.showTooltip(event, d, { index, parent: config.data[groupIndex], parentIndex: groupIndex, valueFormat: self.yAxis.format });
      })
      .on('mouseout', function (this: any) {
        self.hideTooltip();
        select(this)
          .transition()
          .duration(self.transitionService.getTransitionDuration() / 5)
          .style('fill', () => {
            if (config.spreadColorsPerGroup) {
              const groupIndex = parseInt(this.parentNode.getAttribute('data-group-id'), 10);
              return self.colors[groupIndex];
            }
            const groupIndex = parseInt(this.getAttribute('data-group-bar-id'), 10);
            return self.colors[groupIndex];
          });
      })
      .on('click', (_, d: PcacData) => {
        this.barClickedSource.next(d);
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      // .transition(
      //   transition().duration(this.transitionService.getTransitionDuration())
      // )
      .attr('width', !config.isStacked ? this.xScaleGrouped.bandwidth() : this.xScaleStacked.bandwidth())
      .attr('y', (d: PcacData) => {
        return this.yScale(endOf(d));
      })
      .attr('height', (d: PcacData) => {
        return this.yScale(startOf(d)) - this.yScale(endOf(d));
      });
  }

  private drawThresholdAcrossChart(config: PcacBarVerticalChartConfig) {
    const threshold = groupThreshold(config.thresholds, 0);
    if (!threshold) {
      return;
    }
    this.applyPreTransitionThresholdStyles(this.svg.select('.pcac-bars').append('rect'))
      .attr('width', this.width)
      .attr('data-group-threshold-id', 0)
      .on('mousemove', (event: MouseEvent) => {
        this.showTooltip(event, threshold, { index: 0, isThreshold: true, valueFormat: this.yAxis.format });
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('y', this.yScale(Number(threshold.value)));
  }

  /** One threshold across each group that has one; groups without an entry are skipped. */
  private drawThresholdsPerGroup(config: PcacBarVerticalChartConfig) {
    const self = this;
    const groupIndexOf = (rect: Element) => Number((rect.parentElement as HTMLElement).dataset['groupId']);
    const groups = this.svg.selectAll<SVGGElement, PcacData>('.pcac-bar-group')
      .filter((_: PcacData, i: number) => groupThreshold(config.thresholds, i) !== null);
    this.applyPreTransitionThresholdStyles(groups.append('rect'))
      // Spans its whole group: the pre-transition styles place a rect by bar key, which a group
      // key can collide with.
      .attr('x', 0)
      .attr('width', this.xScaleStacked.bandwidth())
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
          { index, parent: config.data[index], parentIndex: index, isThreshold: true, valueFormat: self.yAxis.format }
        );
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('y', (_: unknown, i: number, nodes: ArrayLike<Element>) => {
        return this.yScale(Number(groupThreshold(config.thresholds, groupIndexOf(nodes[i]))?.value));
      });
  }

  /** One threshold across each bar that has one; bars without an entry are skipped. */
  private drawThresholdsPerBarInGroup(group: GroupType, config: PcacBarVerticalChartConfig) {
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
      .attr('width', this.xScaleGrouped.bandwidth());
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
          { index, parent: config.data[groupIndex], parentIndex: groupIndex, isThreshold: true, valueFormat: self.yAxis.format }
        );
      })
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('y', (_: PcacData, i: number, nodes: ArrayLike<Element>) => {
        return this.yScale(Number(thresholdOf(nodes[i])?.value));
      });
  }

  private applyPreTransitionThresholdStyles<S extends Selection<any, any, any, any>>(elm: S): S {
    return elm.attr('class', 'pcac-threshold')
      .attr('x', (d: any) => {
        // Not every caller's selection has a per-item PcacData bound (the whole-chart threshold
        // rect has none), hence the defensive fallback rather than assuming `d` is always present.
        const datum = d as PcacData | undefined;
        // ScaleBand can return undefined for a key outside its domain; `.attr()` needs null, not undefined.
        return this.xScaleGrouped(datum ? datum.key as string : '') ?? null;
      })
      .attr('y', () => {
        return this.height;
      })
      .attr('height', 0)
      .style('fill', () => {
        return this.colorService.getAlert();
      })
      .style('stroke', () => {
        return this.colorService.getAlert();
      })
      .style('stroke-width', () => {
        return 2;
      })
      .on('mouseout', () => {
        this.hideTooltip();
      })
      .attr('height', () => {
        return '3px';
      });
  }
}
