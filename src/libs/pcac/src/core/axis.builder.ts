import { axisBottom, axisLeft } from 'd3-axis';
import { selection, baseType } from 'd3-selection';

export interface IPcacAxisBuilderConfig {
  svg: selection<baseType, {}, HTMLElement, any>;
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
      .call(axisBottom(config.xScale)
        .tickFormat((d: any, i: number) => {
          return d + 1;
        }).ticks(config.numberOfTicks)
      );

    config.svg.append('g')
      .attr('class', 'pcac-y-axis')
      .call(axisLeft(config.yScale).ticks(config.numberOfTicks));
  }
}
