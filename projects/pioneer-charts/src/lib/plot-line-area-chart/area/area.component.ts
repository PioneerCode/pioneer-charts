import { Component, input, output } from "@angular/core";
import { PcacAreaChartConfig } from "./area.model";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";
import { PcacLineAreaPlotChartConfigType } from "../plot-line-area-chart.model";
import { PcacData } from "../../core";

@Component({
  selector: 'pcac-area-chart',
  // Passes `heightFull` down the wrapper: the inner <pcac-line-area-chart> can only fill a host
  // that has a height itself (see PcacChartConfig.heightFull).
  host: { '[class.pcac-height-full]': 'config().heightFull' },
  templateUrl: './area.component.html',
  imports: [PcacLineAreaChartComponent]
})
export class PcacAreaChart {
  readonly config = input.required<PcacAreaChartConfig>();
  readonly types = PcacLineAreaPlotChartConfigType;
  readonly dotClicked = output<PcacData>()
}
