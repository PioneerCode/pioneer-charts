import { Component, ElementRef, ViewEncapsulation, contentChild, effect, inject, input, viewChild } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { DotPlotChartBuilder } from './dot-plot-chart.builder';
import { PcacDotPlotChartConfig } from './dot-plot-chart.model';
import { PcacChartResizeService } from '../core/resize.service';
import { PcacTooltipDirective } from '../core/tooltip.directive';

/** A dot plot: points along one value axis, stacked into columns where they share a value (see PcacDotPlotChartConfig). */
@Component({
  selector: 'pcac-dot-plot-chart',
  // See PcacBarVerticalChart: `heightFull` needs the host to hand a height down.
  host: { '[class.pcac-height-full]': 'config().heightFull' },
  templateUrl: './dot-plot-chart.component.html',
  styleUrl: './dot-plot-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [DotPlotChartBuilder]
})
export class PcacDotPlotChart {
  private chartBuilder = inject(DotPlotChartBuilder);

  readonly config = input.required<PcacDotPlotChartConfig>();
  private readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly dotClicked = outputFromObservable(this.chartBuilder.dotClicked$);

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
