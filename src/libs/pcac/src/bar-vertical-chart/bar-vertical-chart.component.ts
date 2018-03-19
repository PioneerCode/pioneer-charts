import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges, OnChanges } from '@angular/core';
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  styleUrls: ['./bar-vertical-chart.component.scss'],
  providers: [
    BarVerticalChartBuilder
  ]
})
export class PcacBarChartComponent implements OnChanges {
  @Input() config: IPcacBarVerticalChartConfig;
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
