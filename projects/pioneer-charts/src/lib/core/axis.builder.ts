import { Injectable } from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
import { PcacFormatEnum } from './chart.model';
import { format } from 'd3-format';

export interface IPcacAxisBuilderConfig {
  svg: Selection<BaseType, {}, HTMLElement, any>;
  height: number;
  xScale: any;
  yScale: any;
  numberOfTicks: number;
  yFormat?: PcacFormatEnum;
  xFormat?: PcacFormatEnum;
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
        case PcacFormatEnum.Percentage:
          yAxis.tickFormat(d => d + "%");
          break;
        case PcacFormatEnum.Minutes:
          yAxis.tickFormat((d) => d + 'm');
          break;
        case PcacFormatEnum.Fahrenheit:
          yAxis.tickFormat((d) => d + ' F');
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
      switch (config.xFormat) {
        case PcacFormatEnum.Percentage:
          xAxis.tickFormat(d => d + "%");
          break;
        case PcacFormatEnum.Minutes:
          xAxis.tickFormat((d) => d + 'm');
          break;
        case PcacFormatEnum.Fahrenheit:
          xAxis.tickFormat((d) => d + 'f');
          break;
        case PcacFormatEnum.OneDayHours:
          xAxis.tickFormat((d, i) => {
            const h = d as number;
            const hour = h % 12 === 0 ? 12 : h % 12;
            const period = h < 12 ? 'am' : 'pm';
            return `${hour}${period}`;
          });
          break;
        case PcacFormatEnum.Decimal:
          xAxis.tickFormat((d: any, i: number) => format(".2s")(d));
          break;

      }
    }


    config.svg.append('g')
      .attr('class', 'pcac-x-axis')
      .attr('transform', 'translate(0,' + config.height + ')')
      .call(xAxis);
  }
}
