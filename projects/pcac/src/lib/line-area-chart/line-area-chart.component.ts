import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  EventEmitter,
  Output,
  HostListener
} from '@angular/core';

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

  private resizeWindowTimeout: any;

  constructor(
    private chartBuilder: LineAreaChartBuilder
  ) {
    this.chartBuilder.dotClicked$.subscribe(data => {
      this.dotClicked.emit(data);
    });
  }

  ngOnChanges() {
    this.buildChart();
  }

  buildChart(): void {
    if (this.config && this.config.data && this.config.data.length > 0) {
      this.chartBuilder.buildChart(this.chartElm, this.config);
    }
  }

  /**
   * Opting against fromEvent due to incompatibility with rxjs 5 => 6
   */
  @HostListener('window:resize')
  onResize() {
    const self = this;
    clearTimeout(this.resizeWindowTimeout);
    this.resizeWindowTimeout = setTimeout(() => {
      self.buildChart();
    }, 300);
  }
}
