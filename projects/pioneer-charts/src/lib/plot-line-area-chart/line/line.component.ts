import { Component, input } from "@angular/core";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";
import { PcacLineChartConfig } from "./line.model";
import { PcacLineAreaPlotChartConfigType } from "../plot-line-area-chart.model";

@Component({
  selector: 'pcac-line-chart',
  templateUrl: "./line.component.html",
  imports: [PcacLineAreaChartComponent]
})
export class PcacLineChart {
  readonly config = input.required<PcacLineChartConfig>();
  readonly types = PcacLineAreaPlotChartConfigType;
}