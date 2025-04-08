import { Component, Input, ElementRef, OnChanges, HostListener, ViewEncapsulation, inject, viewChild, output } from '@angular/core';
import { PcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { PcacData } from '../core';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class PcacPieChartComponent implements OnChanges {
  private chartBuilder = inject(PieChartBuilder);

  @Input() config!: PcacPieChartConfig;
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
    if (this.config && this.config.data && this.config.data.length > 0) {
      this.chartBuilder.buildChart(this.chartElm(), this.config);
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
