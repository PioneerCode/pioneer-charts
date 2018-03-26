import { axisBottom, axisLeft } from 'd3-axis';
import { selection, BaseType } from 'd3-selection';

export interface IPcacAxisBuilderConfig {
  svg: d3.Selection<BaseType, {}, HTMLElement, any>;
  height: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
}

export class PcacAxisBuilder {
  drawAxis(config: IPcacAxisBuilderConfig): void {
    config.svg.append('g')
      .attr('class', 'pcac-x-axis')
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(axisBottom(config.xScale).ticks(config.numberOfTicks));

    config.svg.append('g')
      .attr('class', 'pcac-y-axis')
      .call(axisLeft(config.yScale).ticks(config.numberOfTicks));
  }
}
