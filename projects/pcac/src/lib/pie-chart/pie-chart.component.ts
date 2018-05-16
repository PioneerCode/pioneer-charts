import { Component, Input, ViewChild, ElementRef, HostListener, OnChanges, Output, EventEmitter } from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { IPcacData } from '../core';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  providers: [
    PieChartBuilder
  ]
})
export class PcacPieChartComponent implements OnChanges {
  @Input() config: IPcacPieChartConfig;
  @ViewChild('chart') chartElm: ElementRef;
  @Output() sliceClicked: EventEmitter<IPcacData> = new EventEmitter();

  constructor(
    private chartBuilder: PieChartBuilder
  ) {
    this.chartBuilder.sliceClicked$.subscribe(
      data => {
        this.sliceClicked.emit(data);
      });
  }

  ngOnChanges() {
    if (this.config && this.config.data) {
      this.buildChart();
    }
  }
  buildChart(): void {
    this.chartBuilder.buildChart(this.chartElm, this.config);
  }

  @HostListener('window:resize')
  resize(): void {
    this.buildChart();
  }
}
