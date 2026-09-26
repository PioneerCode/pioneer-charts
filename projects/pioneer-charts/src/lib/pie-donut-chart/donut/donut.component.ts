import { Component, contentChild, input, output } from '@angular/core';
import { PcacPieDonutChartComponent } from '../pie-donut-chart.component';
import { PcacPieDonutChartType } from '../pie-donut-chart.model';
import { PcacDonutChartConfig } from './donut.model';
import { PcacData } from '../../core';
import { PcacTooltipDirective } from '../../core/tooltip.directive';

@Component({
  selector: 'pcac-donut-chart',
  templateUrl: './donut.component.html',
  imports: [PcacPieDonutChartComponent]
})
export class PcacDonutChart {
  readonly config = input.required<PcacDonutChartConfig>();
  readonly types = PcacPieDonutChartType;
  readonly sliceClicked = output<PcacData>();

  /**
   * Optional consumer `<ng-template pcacTooltip>` projected into this element, forwarded to the
   * inner chart (see PcacPieDonutChartComponent.tooltipTemplate).
   */
  readonly tooltipTemplate = contentChild(PcacTooltipDirective);
}
