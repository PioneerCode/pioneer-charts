import { axisBottom, axisLeft } from 'd3-axis';
import { selection, BaseType } from 'd3-selection';
import { format } from 'd3-format';

export interface IPcacAxisBuilderConfig {
  svg: d3.Selection<BaseType, {}, HTMLElement, any>;
  height: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
  yFormat?: string;
  xFormat?: string;
}

export class PcacAxisBuilder {
  drawAxis(config: IPcacAxisBuilderConfig): void {
    this.drawXAxis(config);
    this.drawYAxis(config);
  }

  private drawYAxis(config: IPcacAxisBuilderConfig) {

        // switch (this.config.tickFormat.toLocaleLowerCase()) {
    //   case 'percentage':
    //     axisY.tickFormat(d3.format('.0%'));
    //     break;
    //   case 'minutes':
    //     axisY.tickFormat((d) => d + 'm');
    //     break;
    // }
    const yAxis = axisLeft(config.yScale).ticks(config.numberOfTicks);
    config.svg.append('g')
      .attr('class', 'pcac-y-axis')
      .call(yAxis);
  }

  private drawXAxis(config: IPcacAxisBuilderConfig) {
    const xAxis = axisBottom(config.xScale).ticks(config.numberOfTicks);
    config.svg.append('g')
      .attr('class', 'pcac-x-axis')
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(xAxis);
  }
}
