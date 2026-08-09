import { Component, ElementRef, OnChanges, ViewEncapsulation, inject, viewChild, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { PcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { PcacChartResizeService } from '../../core/resize.service';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  styleUrls: ['./bar-vertical-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [BarVerticalChartBuilder]
})
export class PcacBarVerticalChartComponent implements OnChanges {
  private chartBuilder = inject(BarVerticalChartBuilder);

  readonly config = input.required<PcacBarVerticalChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly barClicked = outputFromObservable(this.chartBuilder.barClicked$);

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
