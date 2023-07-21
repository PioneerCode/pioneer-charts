import { Injectable } from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
import { PcacTickFormatEnum } from './chart.model';

export interface IPcacAxisBuilderConfig {
  svg: Selection<BaseType, {}, HTMLElement, any>;
  height: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
  yFormat?: PcacTickFormatEnum;
  xFormat?: PcacTickFormatEnum;
  hideYAxis?: boolean;
  hideXAxis?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PcacAxisBuilder {
  drawAxis(config: IPcacAxisBuilderConfig): void {
    if (!config.hideXAxis) {
      this.drawXAxis(config);
    }
    if (!config.hideYAxis) {
      this.drawYAxis(config);
    }
  }

  private drawYAxis(config: IPcacAxisBuilderConfig) {
    const yAxis = axisLeft(config.yScale).ticks(config.numberOfTicks);

    if (config.yFormat) {
      switch (config.yFormat.toLocaleLowerCase()) {
        case PcacTickFormatEnum.Percentage:
          // let f = format('.0%') No longer works
          yAxis.tickFormat(d => d + "%");
          break;
        case PcacTickFormatEnum.Minutes:
          yAxis.tickFormat((d) => d + 'm');
          break;
      }
    }

    config.svg.append('g')
      .attr('class', 'pcac-y-axis')
      .call(yAxis);
  }

  private drawXAxis(config: IPcacAxisBuilderConfig) {
    const xAxis = axisBottom(config.xScale).ticks(config.numberOfTicks);

    if (config.xFormat) {
      switch (config.xFormat.toLocaleLowerCase()) {
        case PcacTickFormatEnum.Percentage:
          xAxis.tickFormat(d => d + "%");
          break;
        case PcacTickFormatEnum.Minutes:
          xAxis.tickFormat((d) => d + 'm');
          break;
      }
    }

    config.svg.append('g')
      .attr('class', 'pcac-x-axis')
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(xAxis);
  }
}
