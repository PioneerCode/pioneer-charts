import { Component, ElementRef, OnChanges, ViewEncapsulation, SimpleChanges, inject, viewChild, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from './plot-line-area-chart.model';
import { PlaChartBuilder } from './core/builders/chart.builder';
import { PcacChartResizeService } from '../core/resize.service';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './plot-line-area-chart.component.html',
  styleUrls: ['./plot-line-area-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PcacLineAreaChartComponent implements OnChanges {
  private chartBuilder = new PlaChartBuilder();

  readonly config = input.required<PcacLineAreaChartConfig>();
  readonly type = input.required<PcacLineAreaPlotChartConfigType>();

  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly dotClicked = outputFromObservable(this.chartBuilder.dotClicked$);

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'].currentValue !== changes['config'].previousValue) {
      this.buildChart()
    }
  }

  buildChart(): void {
    const config = this.config();
    if (config && config.data && config.data.length > 0) {
      this.chartBuilder.buildChart(this.chartElm(), config, this.type());
    }
  }
}
