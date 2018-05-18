import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { IPcacData } from '../core';
import { fromEvent, Subscription } from 'rxjs';

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

  private resizeWindowTimeout: NodeJS.Timer;

  constructor(
    private chartBuilder: PieChartBuilder
  ) {
    this.chartBuilder.sliceClicked$.subscribe(data => {
      this.sliceClicked.emit(data);
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
