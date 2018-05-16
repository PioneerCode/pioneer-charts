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
import { BarHorizontalChartBuilder } from './bar-horizontal-chart.builder';
import { IPcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { IPcacData } from '../../core';
import { debounce } from '../../core/debounce.decartor';

@Component({
  selector: 'pcac-bar-horizontal-chart',
  templateUrl: './bar-horizontal-chart.component.html',
  providers: [
    BarHorizontalChartBuilder
  ]
})
export class PcacBarChartHorizontalComponent implements OnChanges {
  @Input() config: IPcacBarHorizontalChartConfig;
  @ViewChild('chart') chartElm: ElementRef;
  @Output() barClicked: EventEmitter<IPcacData> = new EventEmitter();
  private resizeDebounceTimeout: any;

  constructor(
    private chartBuilder: BarHorizontalChartBuilder,
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
  @debounce()
  resize(): void {
    this.buildChart();
  }
}
