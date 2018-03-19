import { axisBottom, axisLeft } from 'd3-axis';
import { selection, baseType } from 'd3-selection';

export interface IPcacGridBuilderConfig {
  svg: selection<baseType, {}, HTMLElement, any>;
  width: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
}

export class PcacGridBuilder {
  drawGrid(config: IPcacGridBuilderConfig): void {
    config.svg.append('g')
      .attr('class', 'pcac-grid')
      .selectAll('g.rule')
      .data(config.yScale.ticks(config.numberOfTicks))
      .enter().append('svg:g')
      .attr('class', 'pcac-grid-rule')
      .append('svg:line')
      .attr('y1', (d: number) => config.yScale(d))
      .attr('y2', (d: number) => config.yScale(d))
      .attr('x1', 0)
      .attr('x2', config.width)
      .attr('class', (d: number, i: number) => (i === 0 ? 'last' : 'other'));
  }
}
