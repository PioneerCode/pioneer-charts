import { Component, Input, ViewChild, ElementRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { IPcacLineAreaChartConfig } from './line-area-chart.model';
import { LineAreaChartBuilder } from './line-area-chart.builder';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  providers: [
    LineAreaChartBuilder
  ]
})
export class PcacLineAreaChartComponent implements OnChanges {
  @Input() config: IPcacLineAreaChartConfig;
  @ViewChild('chart') chartElm: ElementRef;

  constructor(
    private chartBuilder: LineAreaChartBuilder
  ) { }

  ngOnChanges(changes: SimpleChanges) {
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
