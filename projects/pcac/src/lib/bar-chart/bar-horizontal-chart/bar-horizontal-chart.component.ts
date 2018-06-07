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

  private resizeWindowTimeout: any;

  constructor(
    private chartBuilder: BarHorizontalChartBuilder,
  ) {
    this.chartBuilder.barClicked$.subscribe(data => {
      this.barClicked.emit(data);
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
