import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  Output,
  EventEmitter,
  HostListener,
  ViewEncapsulation
} from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { IPcacData } from '../core';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class PcacPieChartComponent implements OnChanges {
  @Input() config!: IPcacPieChartConfig;
  @ViewChild('chart', { static: true }) chartElm!: ElementRef;
  @Output() sliceClicked: EventEmitter<IPcacData> = new EventEmitter();

  private resizeWindowTimeout: any;

  constructor(
    private chartBuilder: PieChartBuilder
  ) {
    this.chartBuilder.sliceClicked$.subscribe(data => {
      this.sliceClicked.emit(data);
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
