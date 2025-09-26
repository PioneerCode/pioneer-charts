import { Component, input } from "@angular/core";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";
import { PcacPlotChartConfig } from "./plot.model";
import { PcacLineAreaPlotChartConfigType } from "../plot-line-area-chart.model";

@Component({
  selector: 'pcac-plot-chart',
  templateUrl: './plot.component.html',
  imports: [PcacLineAreaChartComponent]
})
export class PcacPlotChart {
  readonly config = input.required<PcacPlotChartConfig>();
  readonly types = PcacLineAreaPlotChartConfigType;
}