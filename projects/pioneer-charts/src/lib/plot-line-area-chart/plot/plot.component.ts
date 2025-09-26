import { Component, ViewEncapsulation } from "@angular/core";
import { PcacLineAreaChartComponent } from "../plot-line-area-chart.component";

@Component({
  selector: 'pcac-plot-chart',
  templateUrl: './plot.component.html',
  imports: [PcacLineAreaChartComponent],
  encapsulation: ViewEncapsulation.None
})
export class PcacPlotChart {

}