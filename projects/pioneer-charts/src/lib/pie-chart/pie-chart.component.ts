import { Component, ElementRef, OnChanges, ViewEncapsulation, inject, viewChild, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { PcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { PcacChartResizeService } from '../core/resize.service';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [PieChartBuilder]
})
export class PcacPieChartComponent implements OnChanges {
  private chartBuilder = inject(PieChartBuilder);

  readonly config = input.required<PcacPieChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly sliceClicked = outputFromObservable(this.chartBuilder.sliceClicked$);

  constructor() {
    inject(PcacChartResizeService).observe(this.chartElm, () => {
      // Skip the ResizeObserver's routine initial callback when it lands after ngOnChanges
      // already built successfully at this same width — only a real size change (or a build
      // that never happened, e.g. the 0-width mount race) should trigger a rebuild here.
      if (this.chartBuilder.containerSizeChanged(this.chartElm())) {
        this.buildChart();
      }
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
}
