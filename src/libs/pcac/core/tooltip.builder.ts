import { Injectable } from '@angular/core';
import { IPcacData } from '../core';
import { format } from 'd3-format';
import { select, event } from 'd3-selection';

export interface IPcacTooltipBuilder {
  showBarTooltip(data: IPcacData, tickFormat: string): void;
  hideTooltip(): void;
}

@Injectable()
export class PcacTooltipBuilder implements IPcacTooltipBuilder {

  tooltip = select('body').append('div').attr('class', 'pcac-d3-tooltip');

  showBarTooltip(data: IPcacData, tickFormat?: string): void {
    this.tooltip.style('left', event.pageX - 50 + 'px')
      .style('top', event.pageY - 70 + 'px')
      .style('display', 'inline-block')
      .html(this.getBarTipData(data, tickFormat));
  }

  hideTooltip(): void {
    this.tooltip.style('display', 'none');
  }

  private getBarTipData(data: IPcacData, tickFormat: string): string {
    let value = data.value.toString();
    switch (tickFormat) {
      case 'percentage':
        value = format('.0%')(data.value as number);
        break;
      case 'minutes':
        // TODO: Consider break % into seconds
        value = Math.round((data.value as number / 60)) + 'm';
        break;
    }
    return data.key ? data.key + '</br>' + value : value;
  }
}
