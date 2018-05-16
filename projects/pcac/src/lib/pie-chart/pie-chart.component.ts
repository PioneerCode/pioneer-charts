import { Component, Input, ViewChild, ElementRef, HostListener, OnChanges, Output, EventEmitter } from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { IPcacData } from '../core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
    this.chartBuilder.sliceClicked$.subscribe(data => {
      this.sliceClicked.emit(data);
    });
    fromEvent(window, 'resize').pipe(
      debounceTime(100)
    ).subscribe((event) => {
      this.buildChart();
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
}
