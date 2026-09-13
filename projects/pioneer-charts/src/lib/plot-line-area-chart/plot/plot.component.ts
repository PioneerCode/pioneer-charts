import { Component, contentChild, input, output } from "@angular/core";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";
import { PcacPlotChartConfig } from "./plot.model";
import { PcacLineAreaPlotChartConfigType } from "../plot-line-area-chart.model";
import { PcacData } from "../../core";
import { PcacTooltipDirective } from "../../core/tooltip.directive";

@Component({
  selector: 'pcac-plot-chart',
  // Passes `heightFull` down the wrapper: the inner <pcac-line-area-chart> can only fill a host
  // that has a height itself (see PcacChartConfig.heightFull).
  host: { '[class.pcac-height-full]': 'config().heightFull' },
  templateUrl: './plot.component.html',
  imports: [PcacLineAreaChartComponent]
})
export class PcacPlotChart {
  readonly config = input.required<PcacPlotChartConfig>();
  readonly types = PcacLineAreaPlotChartConfigType;
  readonly dotClicked = output<PcacData>();

  /**
   * Optional consumer `<ng-template pcacTooltip>` projected into this element, forwarded to the
   * inner chart (see PcacLineAreaChartComponent.tooltipTemplate for why it can't query it itself).
   */
  readonly tooltipTemplate = contentChild(PcacTooltipDirective);
}
