import { Component, ElementRef, ViewEncapsulation, effect, inject, viewChild, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from './plot-line-area-chart.model';
import { PlaChartBuilder } from './core/builders/chart.builder';
import { PcacChartResizeService } from '../core/resize.service';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './plot-line-area-chart.component.html',
  styleUrl: './plot-line-area-chart.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PcacLineAreaChartComponent {
  private chartBuilder = new PlaChartBuilder();

  readonly config = input.required<PcacLineAreaChartConfig>();
  readonly type = input.required<PcacLineAreaPlotChartConfigType>();

  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly dotClicked = outputFromObservable(this.chartBuilder.dotClicked$);

  constructor() {
    // Reacts to config()/type() the same way ngOnChanges used to — reading them here (rather
    // than a lifecycle hook) is what makes this an effect: it tracks whichever signals
    // buildChart() reads and reruns whenever either changes. That includes type(), which the old
    // ngOnChanges deliberately ignored (it only compared changes['config']) — in practice type()
    // is always bound to a constant per wrapper (PcacLineChart/PcacAreaChart/PcacPlotChart), so
    // this is unreachable today, but reacting to it is the more correct behavior regardless.
    effect(() => this.buildChart());

    inject(PcacChartResizeService).observe(this.chartElm, () => {
      // Skip the ResizeObserver's routine initial callback when it lands after the effect above
      // already built successfully at this same width — only a real size change (or a build
      // that never happened, e.g. the 0-width mount race) should trigger a rebuild here.
      if (this.chartBuilder.containerSizeChanged(this.chartElm())) {
        this.buildChart();
      }
    });
  }

  buildChart(): void {
    const config = this.config();
    if (config && config.data && config.data.length > 0) {
      this.chartBuilder.buildChart(this.chartElm(), config, this.type());
    }
  }
}
