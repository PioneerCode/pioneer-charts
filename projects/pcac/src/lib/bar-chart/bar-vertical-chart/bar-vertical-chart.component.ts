import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  HostListener,
  OnChanges,
  EventEmitter,
  Output
} from '@angular/core';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { IPcacData } from '../../core';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  providers: [
    BarVerticalChartBuilder
  ]
})
export class PcacBarVerticalChartComponent implements OnChanges {
  @Input() config: IPcacBarVerticalChartConfig;
  @ViewChild('chart') chartElm: ElementRef;
  @Output() barClicked: EventEmitter<IPcacData> = new EventEmitter();
  private resizeDebounceTimeout: any;

  constructor(
    private chartBuilder: BarVerticalChartBuilder
  ) {
    this.chartBuilder.barClicked$.subscribe(
      data => {
        this.barClicked.emit(data);
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
