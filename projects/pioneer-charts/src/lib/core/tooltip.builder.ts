import { Injectable } from '@angular/core';
import { IPcacData, PcacTickFormatEnum } from './chart.model';
import { select } from 'd3';

@Injectable({
  providedIn: 'root',
})
export class PcacTooltipBuilder {
  public tooltip = select('body')
    .append('div')
    .attr('class', 'pcac-d3-tooltip') as any; // TODO: Strongly type

  showBarTooltip(event: MouseEvent, data: IPcacData, tickFormat?: PcacTickFormatEnum,): void {
    this.tooltip.style('left', event.pageX - 60 + 'px')
      .style('top', event.pageY - 55 + 'px')
      .style('display', 'inline-block')
      .html(this.getBarTipData(data, tickFormat));
  }

  hideTooltip(): void {
    this.tooltip.style('display', 'none');
  }

  private getBarTipData(data: IPcacData, tickFormat?: PcacTickFormatEnum): string {
    let value = data.value;

    if (tickFormat) {
      switch (tickFormat.toLocaleLowerCase()) {
        case PcacTickFormatEnum.Percentage:
          value = value as number * 100 + '%';
          break;
        case PcacTickFormatEnum.Minutes:
          break;
      }
    }

    return data.key ? data.key + '</br>' + value.toString() : value.toString();
  }
}
