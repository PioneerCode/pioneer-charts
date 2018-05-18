import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  EventEmitter,
  Output,
  HostListener
} from '@angular/core';
import { BarHorizontalChartBuilder } from './bar-horizontal-chart.builder';
import { IPcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { IPcacData } from '../../core';
import { fromEvent, Subscription } from 'rxjs';

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

  private resizeWindowTimeout: NodeJS.Timer;

  constructor(
    private chartBuilder: BarHorizontalChartBuilder,
  ) {
    this.chartBuilder.barClicked$.subscribe(data => {
      this.barClicked.emit(data);
    });
  }

  ngOnChanges() {
    if (this.config && this.config.data && this.config.data.length > 0) {
      this.buildChart();
    }
  }

  buildChart(): void {
    this.chartBuilder.buildChart(this.chartElm, this.config);
  }

  /**
   * Opting against fromEvent due to incompatibility with rxjs 5 => 6
   */
  @HostListener('window:resize')
  onResize() {
    const self = this;
    clearTimeout(this.resizeWindowTimeout);
    this.resizeWindowTimeout = setTimeout(() => {
      if (self.config.data.length > 0) {
        self.buildChart();
      }
    }, 300);
  }
}
