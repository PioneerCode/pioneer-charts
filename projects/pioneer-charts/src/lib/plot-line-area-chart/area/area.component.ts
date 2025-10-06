import { Component, input, output, viewChild } from "@angular/core";
import { PcacAreaChartConfig } from "./area.model";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";
import { PcacLineAreaPlotChartConfigType } from "../plot-line-area-chart.model";
import { PcacData } from "../../core";

@Component({
  selector: 'pcac-area-chart',
  templateUrl: './area.component.html',
  imports: [PcacLineAreaChartComponent]
})
export class PcacAreaChart {
  readonly config = input.required<PcacAreaChartConfig>();
  readonly types = PcacLineAreaPlotChartConfigType;
  readonly dotClicked = output<PcacData>()

  private chart = viewChild(PcacLineAreaChartComponent);

  onResize() {
    this.chart()?.onResize();
  }
}