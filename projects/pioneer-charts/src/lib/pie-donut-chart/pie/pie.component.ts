import { Component, contentChild, input, output } from '@angular/core';
import { PcacPieDonutChartComponent } from '../pie-donut-chart.component';
import { PcacPieDonutChartType } from '../pie-donut-chart.model';
import { PcacPieChartConfig } from './pie.model';
import { PcacData } from '../../core';
import { PcacTooltipDirective } from '../../core/tooltip.directive';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie.component.html',
  imports: [PcacPieDonutChartComponent]
})
export class PcacPieChart {
  readonly config = input.required<PcacPieChartConfig>();
  readonly types = PcacPieDonutChartType;
  readonly sliceClicked = output<PcacData>();

  /**
   * Optional consumer `<ng-template pcacTooltip>` projected into this element, forwarded to the
   * inner chart (see PcacPieDonutChartComponent.tooltipTemplate).
   */
  readonly tooltipTemplate = contentChild(PcacTooltipDirective);
}
