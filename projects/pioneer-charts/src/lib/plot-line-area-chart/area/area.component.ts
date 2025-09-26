import { Component, input } from "@angular/core";
import { PcacAreaChartConfig } from "./area.model";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";
import { PcacLineAreaPlotChartConfigType } from "../plot-line-area-chart.model";

@Component({
  selector: 'pcac-area-chart',
  templateUrl: './area.component.html',
  imports: [PcacLineAreaChartComponent]
})
export class PcacAreaChart {
  readonly config = input.required<PcacAreaChartConfig>();
  readonly types = PcacLineAreaPlotChartConfigType;
}