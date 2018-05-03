import { axisBottom, axisLeft } from 'd3-axis';
import { selection, BaseType } from 'd3-selection';
import { format } from 'd3-format';

export interface IPcacAxisBuilderConfig {
  svg: d3.Selection<BaseType, {}, HTMLElement, any>;
  height: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
  yFormat?: PcacAxisFormatEnum;
  xFormat?: PcacAxisFormatEnum;
}

export enum PcacAxisFormatEnum {
  None = 'none',
  Percentage = 'percentage',
  Minutes = 'minutes'
}

export class PcacAxisBuilder {
  drawAxis(config: IPcacAxisBuilderConfig): void {
    this.drawXAxis(config);
    this.drawYAxis(config);
  }

  private drawYAxis(config: IPcacAxisBuilderConfig) {
    const yAxis = axisLeft(config.yScale).ticks(config.numberOfTicks);

    switch (config.yFormat.toLocaleLowerCase()) {
      case PcacAxisFormatEnum.Percentage:
        yAxis.tickFormat(format('.0%'));
        break;
      case PcacAxisFormatEnum.Minutes:
        yAxis.tickFormat((d) => d + 'm');
        break;
    }

    config.svg.append('g')
      .attr('class', 'pcac-y-axis')
      .call(yAxis);
  }

  private drawXAxis(config: IPcacAxisBuilderConfig) {
    const xAxis = axisBottom(config.xScale).ticks(config.numberOfTicks);

    switch (config.xFormat.toLocaleLowerCase()) {
      case PcacAxisFormatEnum.Percentage:
        xAxis.tickFormat(format('.0%'));
        break;
      case PcacAxisFormatEnum.Minutes:
        xAxis.tickFormat((d) => d + 'm');
        break;
    }

    config.svg.append('g')
      .attr('class', 'pcac-x-axis')
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(xAxis);
  }
}
