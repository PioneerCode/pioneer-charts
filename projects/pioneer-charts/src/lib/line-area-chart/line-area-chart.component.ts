import { Component, ElementRef, HostListener, ViewEncapsulation, SimpleChanges, inject, viewChild, output, input } from '@angular/core';

import { PcacLineAreaChartConfig } from './line-area-chart.model';
import { LineAreaChartBuilder } from './line-area-chart.builder';
import { PcacData } from '../core';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  styleUrls: ['./line-area-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PcacLineAreaChartComponent {
  private chartBuilder = inject(LineAreaChartBuilder);

  readonly config = input.required<PcacLineAreaChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly dotClicked = output<PcacData>();

  private resizeWindowTimeout: any;

  constructor() {
    this.chartBuilder.dotClicked$.subscribe(data => {
      this.dotClicked.emit(data);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'].currentValue !== changes['config'].previousValue) {
      this.buildChart()
    }
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
