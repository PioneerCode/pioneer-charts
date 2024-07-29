import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  EventEmitter,
  Output,
  HostListener,
  ViewEncapsulation
} from '@angular/core';
import { BarHorizontalChartBuilder } from './bar-horizontal-chart.builder';
import { PcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { PcacData } from '../../core';

@Component({
  selector: 'pcac-bar-horizontal-chart',
  templateUrl: './bar-horizontal-chart.component.html',
  styleUrls: ['./bar-horizontal-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class PcacBarHorizontalChartComponent implements OnChanges {
  @Input() config!: PcacBarHorizontalChartConfig;
  @ViewChild('chart', { static: true }) chartElm!: ElementRef;
  @Output() barClicked: EventEmitter<PcacData> = new EventEmitter();

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
