import { Component, ElementRef, ViewEncapsulation, contentChild, effect, inject, input, viewChild } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { ProximityChartBuilder } from './proximity-chart.builder';
import { PcacProximityChartConfig } from './proximity-chart.model';
import { PcacChartResizeService } from '../core/resize.service';
import { PcacTooltipDirective } from '../core/tooltip.directive';

/** A proximity chart: an item in the middle, others around it by closeness (see PcacProximityChartConfig). */
@Component({
  selector: 'pcac-proximity-chart',
  // See PcacBarVerticalChart: `heightFull` needs the host to hand a height down.
  host: { '[class.pcac-height-full]': 'config().heightFull' },
  templateUrl: './proximity-chart.component.html',
  styleUrl: './proximity-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [ProximityChartBuilder]
})
export class PcacProximityChart {
  private chartBuilder = inject(ProximityChartBuilder);

  readonly config = input.required<PcacProximityChartConfig>();
  private readonly chartElm = viewChild.required<ElementRef>('chart');
  /** An item - or the center - was clicked, or activated with Enter or Space. */
  readonly itemClicked = outputFromObservable(this.chartBuilder.itemClicked$);

  /** Optional consumer `<ng-template pcacTooltip>`, replacing the default tooltip (see PcacTooltipDirective). */
  readonly tooltipTemplate = contentChild(PcacTooltipDirective);

  constructor() {
    effect(() => this.buildChart());
    // A getter, so the builder reads the query at hover time rather than in the effect above.
    this.chartBuilder.tooltipTemplate = () => this.tooltipTemplate()?.templateRef;
    inject(PcacChartResizeService).observe(this.chartElm, () => {
      if (this.chartBuilder.containerSizeChanged(this.chartElm())) {
        this.buildChart();
      }
    });
  }

  private buildChart(): void {
    const config = this.config();
    // Handed over even when empty: the builder clears what it last drew rather than leaving it.
    if (config) {
      this.chartBuilder.buildChart(this.chartElm(), config);
    }
  }
}
