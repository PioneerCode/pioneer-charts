import { Injectable } from '@angular/core';
import { BaseType, Selection } from 'd3-selection';

export interface IPcacGridBuilderConfig {
  svg: Selection<BaseType, {}, HTMLElement, any>;
  /**
   * Required for horizontal grid
   */
  width: number;
  /**
   * Required for vertical grid
   */
  height: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
}


@Injectable({
  providedIn: 'root',
})
export class PcacGridBuilder {
  drawVerticalGrid(config: IPcacGridBuilderConfig): void {
    config.svg.append('g')
      .attr('class', 'pcac-grid')
      .selectAll('g.rule')
      .data(config.xScale.ticks(5))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .attr('transform', (d): string => (`translate(${config.xScale(d)}, 0)`))
      .append('svg:line')
      .attr('y1', 0)
      .attr('y2', config.height)
      .attr('class', (d, i: number) => (i === 0 ? 'pcac-grid-rule-last' : ''));
  }

  drawHorizontalGrid(config: IPcacGridBuilderConfig): void {
    config.svg.append('g')
      .attr('class', 'pcac-grid')
      .selectAll('g.pcac-grid-rule')
      .data(config.yScale.ticks(config.numberOfTicks))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .append('svg:line')
      .attr('y1', (d) => config.yScale(d))
      .attr('y2', (d) => config.yScale(d))
      .attr('x1', 0)
      .attr('x2', config.width)
      .attr('class', (_, i) => (i === 0 ? 'pcac-grid-rule-last' : ''));
  }
}
