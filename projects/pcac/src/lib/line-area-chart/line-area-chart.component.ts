import { Component, Input, ViewChild, ElementRef, HostListener, OnChanges, EventEmitter, Output } from '@angular/core';
import { IPcacLineAreaChartConfig } from './line-area-chart.model';
import { LineAreaChartBuilder } from './line-area-chart.builder';
import { IPcacData } from '../core';

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
  @Output() dotClicked: EventEmitter<IPcacData> = new EventEmitter();
  private resizeDebounceTimeout: any;

  constructor(
    private chartBuilder: LineAreaChartBuilder
  ) {
    this.chartBuilder.dotClicked$.subscribe(
      data => {
        this.dotClicked.emit(data);
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
    const self = this;
    this.resizeDebounceTimeout = setTimeout(() => {
      if (self.config.data.length > 0) {
        self.buildChart();
      }
    }, 200);
  }
}
