import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges, OnChanges } from '@angular/core';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { IPcacBarChartConfig } from './bar-chart.model';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  providers: [
    BarVerticalChartBuilder
  ]
})
export class PcacBarVerticalChartComponent implements OnChanges {
  @Input() config: IPcacBarChartConfig;
  @ViewChild('chart') chartElm: ElementRef;

  constructor(
    private chartBuilder: BarVerticalChartBuilder,
  ) { }

  ngOnChanges() {
    if (this.config && this.config.data) {
      this.buildChart();
    }
  }

  buildChart(): void {
    this.chartBuilder.buildChart(this.chartElm, this.config);
  }

  // @HostListener('window:resize')
  // resize(): void {
  //   this.buildChart();
  // }
}
