import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  providers: [
    PieChartBuilder
  ]
})
export class PcacPieChartComponent implements OnChanges {
  @Input() config: IPcacPieChartConfig;
  @ViewChild('chart') chartElm: ElementRef;

  constructor(
    private chartBuilder: PieChartBuilder
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
