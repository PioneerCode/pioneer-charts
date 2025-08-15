import { Component, ElementRef, OnChanges, HostListener, ViewEncapsulation, inject, viewChild, output, input } from '@angular/core';
import { PcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { PcacData } from '../core';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PcacPieChartComponent implements OnChanges {
  private chartBuilder = inject(PieChartBuilder);

  readonly config = input.required<PcacPieChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly sliceClicked = output<PcacData>();

  private resizeWindowTimeout: any;

  constructor() {
    this.chartBuilder.sliceClicked$.subscribe(data => {
      this.sliceClicked.emit(data);
    });
  }

  ngOnChanges() {
    this.buildChart();
  }

  buildChart(): void {
    const config = this.config();
    if (config && config.data && config.data.length > 0) {
      this.chartBuilder.buildChart(this.chartElm(), config);
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
