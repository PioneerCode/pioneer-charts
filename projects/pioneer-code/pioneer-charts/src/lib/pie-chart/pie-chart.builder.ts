import { Injectable, ElementRef } from '@angular/core';

/**
 * D3
 */
import { arc, pie, DefaultArcObject, Arc, Pie, PieArcDatum } from 'd3-shape';
import { select } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { transition } from 'd3-transition';
import { color } from 'd3-color';

/**
 * Lib
 */
import { IPcacPieChartConfig } from './pie-chart.model';
import { PcacAxisBuilder } from '../core/axis.builder';
import { PcacGridBuilder } from '../core/grid.builder';
import { PcacTransitionService } from '../core/transition.service';
import { PcacTooltipBuilder } from '../core/tooltip.builder';
import { PcacColorService } from '../core/color.service';
import { PcacChart } from '../core/chart';
import { IPcacData } from '../core/chart.model';

import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class PieChartBuilder extends PcacChart {
  private radius!: number;
  private arcShape!: Arc<any, DefaultArcObject> | any;
  private arcOverShape!: Arc<any, DefaultArcObject> | any;
  private pieAngles!: Pie<any, number | {}> | any;
  private sliceClickedSource = new Subject<IPcacData>();
  sliceClicked$ = this.sliceClickedSource.asObservable();

  constructor(
    public override axisBuilder: PcacAxisBuilder,
    public override gridBuilder: PcacGridBuilder,
    public override transitionService: PcacTransitionService,
    public override tooltipBuilder: PcacTooltipBuilder,
    public override colorService: PcacColorService
  ) {
    super(
      axisBuilder,
      gridBuilder,
      transitionService,
      tooltipBuilder,
      colorService
    );
  }

  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.initializeChartState(chartElm, config);
    this.radius = Math.min(Math.min(this.height, this.width), Math.min(this.height, this.width)) / 2;
    this.buildShapes(config);
    this.drawChart(chartElm, config);
  }

  private buildShapes(config: IPcacPieChartConfig): void {
    const radiusOffset = 10;

    this.arcShape = arc()
      .innerRadius(0)
      .outerRadius(this.radius - radiusOffset);

    this.arcOverShape = arc()
      .innerRadius(0)
      .outerRadius(this.radius - radiusOffset + radiusOffset);

    this.pieAngles = pie()
      .sort(null)
      .value((d: any) => d.value);  // TODO: Strongly type
  }

  private drawChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.buildContainer(chartElm, true);
    const self = this;
    this.svg.selectAll('.pcac-arc')
      .data(this.pieAngles(config.data))
      .enter().append('g')
      .attr('class', 'pcac-arc')
      .append('path')
      .style('fill', (d: PieArcDatum<IPcacData>, i: number) => {
        return this.colors[i];
      })
      .on('mouseover', function (this: any, _: MouseEvent, d: PieArcDatum<IPcacData>) {
        const t = transition().duration(self.transitionService.getTransitionDuration() / 3)
        const c = color(self.colors[d.index])
        const ct = c ? c.darker(1).toString() : self.colors[d.index]
        select(this).transition(t)
          .attr('d', self.arcOverShape)
          .style('fill', ct);
      })
      .on('mousemove', (event: MouseEvent, d: PieArcDatum<IPcacData>) => {
        self.tooltipBuilder.showBarTooltip(event, d.data);
      })
      .on('mouseout', function (this: any, _: MouseEvent, d: PieArcDatum<IPcacData>) {
        self.tooltipBuilder.hideTooltip();
        select(this).transition(transition()
          .duration(self.transitionService.getTransitionDuration() / 3))
          .attr('d', self.arcShape)
          .style('fill', self.colors[d.index]);
      })
      .on('click', (d: PieArcDatum<IPcacData>, i: number) => {
        this.sliceClickedSource.next(d.data);
      })
      .transition(transition()
        .duration(this.transitionService.getTransitionDuration()))
      .attrTween('d', (b: PieArcDatum<IPcacData>) => {
        return this.tweenChart(b);
      });
  }

  private tweenChart(b: any) {  // TODO: Strongly type
    b.innerRadius = 0;
    const i = interpolate({ startAngle: 0, endAngle: 0 }, b);
    return (t: any) => this.arcShape(i(t));  // TODO: Strongly type
  }
}
