import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges, OnChanges } from '@angular/core';
import { IPcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { BarHorizontalChartBuilder } from './bar-horizontal-chart.builder';

@Component({
  selector: 'pcac-bar-horizontal-chart',
  templateUrl: './bar-horizontal-chart.component.html',
  styleUrls: ['./bar-horizontal-chart.component.scss'],
  providers: [
    BarHorizontalChartBuilder
  ]
})
export class PcacBarChartHorizontalComponent implements OnChanges {
  @Input() config: IPcacBarHorizontalChartConfig;
  @ViewChild('chart') chartElm: ElementRef;

  constructor(
    private chartBuilder: BarHorizontalChartBuilder,
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
