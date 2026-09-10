import { Component, ElementRef, ViewEncapsulation, effect, inject, viewChild, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { BarHorizontalChartBuilder } from './bar-horizontal-chart.builder';
import { PcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';
import { PcacChartResizeService } from '../../core/resize.service';

@Component({
  selector: 'pcac-bar-horizontal-chart',
  // While `config().heightFull` is on, the chart fills its container instead of using a fixed
  // height (see PcacChartConfig.heightFull). That only works if this host element itself has a
  // height to hand down, so the class stretches it to `height: 100%`; the styling lives in CSS
  // rather than being measured/set in JS so the browser resolves it as part of normal layout.
  host: { '[class.pcac-height-full]': 'config().heightFull' },
  templateUrl: './bar-horizontal-chart.component.html',
  styleUrl: './bar-horizontal-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [BarHorizontalChartBuilder]
})
export class PcacBarHorizontalChartComponent {
  private chartBuilder = inject(BarHorizontalChartBuilder);

  readonly config = input.required<PcacBarHorizontalChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly barClicked = outputFromObservable(this.chartBuilder.barClicked$);

  constructor() {
    // Reacts to config() the same way ngOnChanges used to — reading it here (rather than a
    // lifecycle hook) is what makes this an effect: it tracks config() as its dependency and
    // reruns whenever a new value comes in, signal-input-changes-drive-behavior all the way down.
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
      this.chartBuilder.buildChart(this.chartElm(), config);
    }
  }
}
