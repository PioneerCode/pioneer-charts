import { axisBottom, axisLeft } from 'd3-axis';
import { selection, BaseType } from 'd3-selection';

export interface IPcacGridBuilderConfig {
  svg: d3.Selection<BaseType, {}, HTMLElement, any>;
  /**
   * Required for horizontal grid
   */
  width?: number;
  /**
   * Required for vertical grid
   */
  height?: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
}

export class PcacGridBuilder {
  drawVerticalGrid(config: IPcacGridBuilderConfig): void {
    config.svg.append('g')
      .attr('class', 'pcac-grid')
      .selectAll('g.rule')
      .data(config.xScale.ticks(5))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .attr('transform', (d: number) => (`translate(${config.xScale(d)}, 0)`))
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
      .attr('y1', (d: number) => config.yScale(d))
      .attr('y2', (d: number) => config.yScale(d))
      .attr('x1', 0)
      .attr('x2', config.width)
      .attr('class', (d: number, i: number) => (i === 0 ? 'pcac-grid-rule-last' : ''));
  }
}
