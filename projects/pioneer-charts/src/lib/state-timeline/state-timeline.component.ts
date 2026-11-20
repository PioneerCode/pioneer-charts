import { Component, ElementRef, ViewEncapsulation, contentChild, effect, inject, input, viewChild } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { PcacChartResizeService } from '../core/resize.service';
import { PcacTooltipDirective } from '../core/tooltip.directive';
import { StateTimelineBuilder } from './state-timeline.builder';
import { PcacStateTimelineConfig } from './state-timeline.model';

/** A state timeline: rows of periods, each colored by the worst state it was in (see PcacStateTimelineConfig). */
@Component({
  selector: 'pcac-state-timeline',
  // See PcacBarVerticalChart: `heightFull` needs the host to hand a height down.
  host: { '[class.pcac-height-full]': 'config().heightFull' },
  templateUrl: './state-timeline.component.html',
  styleUrl: './state-timeline.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [StateTimelineBuilder]
})
export class PcacStateTimeline {
  private chartBuilder = inject(StateTimelineBuilder);

  readonly config = input.required<PcacStateTimelineConfig>();
  private readonly chartElm = viewChild.required<ElementRef>('chart');
  /** A period clicked, or Enter or Space on one focused: the period itself, from its row's `data`. */
  readonly periodClicked = outputFromObservable(this.chartBuilder.periodClicked$);

  /**
   * Optional consumer `<ng-template pcacTooltip>`, replacing the default tooltip (see
   * PcacTooltipDirective): its `$implicit` is the period, `parent` its row, `index` its place in
   * the row and `parentIndex` the row's among those drawn.
   */
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
