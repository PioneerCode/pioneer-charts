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
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { IPcacData } from '../../core';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  styleUrls: ['./bar-vertical-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class PcacBarVerticalChartComponent implements OnChanges {
  @Input() config!: IPcacBarVerticalChartConfig;
  @ViewChild('chart', { static: true }) chartElm!: ElementRef;
  @Output() barClicked: EventEmitter<IPcacData> = new EventEmitter();

  private resizeWindowTimeout: any;

  constructor(
    private chartBuilder: BarVerticalChartBuilder
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
