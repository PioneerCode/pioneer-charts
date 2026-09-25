import { Component, ElementRef, ViewEncapsulation, contentChild, effect, inject, viewChild, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { PcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { PcacChartResizeService } from '../core/resize.service';
import { PcacTooltipDirective } from '../core/tooltip.directive';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [PieChartBuilder]
})
export class PcacPieChartComponent {
  private chartBuilder = inject(PieChartBuilder);

  readonly config = input.required<PcacPieChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly sliceClicked = outputFromObservable(this.chartBuilder.sliceClicked$);

  /**
   * Optional consumer `<ng-template pcacTooltip>` projected into this element; replaces the
   * default tooltip when present (see PcacTooltipDirective).
   */
  readonly tooltipTemplate = contentChild(PcacTooltipDirective);

  constructor() {
    // Reacts to config() the same way ngOnChanges used to — reading it here (rather than a
    // lifecycle hook) is what makes this an effect: it tracks config() as its dependency and
    // reruns whenever a new value comes in, signal-input-changes-drive-behavior all the way down.
    effect(() => this.buildChart());

    // Handed over as a getter so the builder reads the query at hover time, not in the effect
    // above (see PcacChart.tooltipTemplate).
    this.chartBuilder.tooltipTemplate = () => this.tooltipTemplate()?.templateRef;

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
    // Handed over even when empty: the builder clears what it last drew rather than leaving it.
    if (config) {
      this.chartBuilder.buildChart(this.chartElm(), config);
    }
  }
}
