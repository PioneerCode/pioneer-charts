import { Injectable } from '@angular/core';
import { IPcacData, PcacFormatEnum } from './chart.model';
import { select } from 'd3';

@Injectable({
  providedIn: 'root',
})
export class PcacTooltipBuilder {
  public tooltip = select('body')
    .append('div')
    .attr('class', 'pcac-d3-tooltip') as any; // TODO: Strongly type

  showBarTooltip(event: MouseEvent, data: IPcacData, valueFormat?: PcacFormatEnum, keyFormat?: PcacFormatEnum): void {
    this.tooltip.style('left', event.pageX - 60 + 'px')
      .style('top', event.pageY - 55 + 'px')
      .style('display', 'inline-block')
      .html(this.getBarTipData(data, valueFormat, keyFormat));
  }

  hideTooltip(): void {
    this.tooltip.style('display', 'none');
  }

  private getBarTipData(data: IPcacData, valueFormat?: PcacFormatEnum, keyFormat?: PcacFormatEnum): string {
    let value = data.value;
    let key = data.key

    if (valueFormat) {
      switch (valueFormat) {
        case PcacFormatEnum.Percentage:
          value = value as number * 100 + '%';
          break;
        case PcacFormatEnum.Fahrenheit:
          value = `${value} F`;
          break;
      }
    }

    if (keyFormat) {
      switch (keyFormat) {
        case PcacFormatEnum.DateTime:
          key = new Date(key).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          break;
      }
    }

    return key ? key + '</br>' + value.toString() : value.toString();
  }
}
