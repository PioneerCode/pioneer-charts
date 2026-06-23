import { Component, input, output, viewChild, ChangeDetectionStrategy } from "@angular/core";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";
import { PcacLineChartConfig } from "./line.model";
import { PcacLineAreaPlotChartConfigType } from "../plot-line-area-chart.model";
import { PcacData } from "../../core";

@Component({
  selector: 'pcac-line-chart',
  templateUrl: "./line.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PcacLineAreaChartComponent]
})
export class PcacLineChart {
  readonly config = input.required<PcacLineChartConfig>();
  readonly types = PcacLineAreaPlotChartConfigType;
  readonly dotClicked = output<PcacData>()

  private chart = viewChild(PcacLineAreaChartComponent);

  onResize() {
    this.chart()?.onResize();
  }
}