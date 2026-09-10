import { Component, ElementRef, ViewEncapsulation, effect, inject, viewChild, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from './plot-line-area-chart.model';
import { PlaChartBuilder } from './core/builders/chart.builder';
import { PlaChartEffectsBuilder } from './core/builders/effects.builders';
import { PcacChartResizeService } from '../core/resize.service';

@Component({
  selector: 'pcac-line-area-chart',
  // While `config().heightFull` is on, the chart fills its container instead of using a fixed
  // height (see PcacChartConfig.heightFull). That only works if this host element itself has a
  // height to hand down, so the class stretches it to `height: 100%`; the styling lives in CSS
  // rather than being measured/set in JS so the browser resolves it as part of normal layout.
  host: { '[class.pcac-height-full]': 'config().heightFull' },
  templateUrl: './plot-line-area-chart.component.html',
  styleUrl: './plot-line-area-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
  // PlaChartEffectsBuilder must be listed here too, not just PlaChartBuilder: it's injected
  // *inside* PlaChartBuilder, but its own per-instance state (see its class doc) still needs
  // this component's injector to shadow its (default) root scope, or every <pcac-line-area-chart>
  // on the page would share one PlaChartEffectsBuilder instance.
  providers: [PlaChartBuilder, PlaChartEffectsBuilder]
})
export class PcacLineAreaChartComponent {
  private chartBuilder = inject(PlaChartBuilder);

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
