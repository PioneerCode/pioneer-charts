import { Component, ElementRef, TemplateRef, ViewEncapsulation, effect, inject, input, viewChild } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { PcacPieDonutChartConfig, PcacPieDonutChartType } from './pie-donut-chart.model';
import { PieDonutChartBuilder } from './pie-donut-chart.builder';
import { PcacChartResizeService } from '../core/resize.service';
import { PcacTooltipContext } from '../core/tooltip.directive';

/**
 * The chart the pie and donut charts share, drawn by `PcacPieChart` and `PcacDonutChart` with
 * their own `type`. Internal, like `<pcac-line-area-chart>` behind the line, area and plot charts.
 */
@Component({
  selector: 'pcac-pie-donut-chart',
  templateUrl: './pie-donut-chart.component.html',
  styleUrl: './pie-donut-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [PieDonutChartBuilder]
})
export class PcacPieDonutChartComponent {
  private chartBuilder = inject(PieDonutChartBuilder);

  readonly config = input.required<PcacPieDonutChartConfig>();
  readonly type = input.required<PcacPieDonutChartType>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly sliceClicked = outputFromObservable(this.chartBuilder.sliceClicked$);

  /**
   * The consumer's `<ng-template pcacTooltip>`, forwarded by the wrapper it was projected into:
   * a content query here wouldn't see it through the wrapper's template (see
   * PcacLineAreaChartComponent.tooltipTemplate).
   */
  readonly tooltipTemplate = input<TemplateRef<PcacTooltipContext>>();

  constructor() {
    // Tracks config() and type(), rebuilding whenever either changes.
    effect(() => this.buildChart());

    // Handed over as a getter so the builder reads the input at hover time, not in the effect
    // above (see PcacChart.tooltipTemplate).
    this.chartBuilder.tooltipTemplate = () => this.tooltipTemplate();

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
    const type = this.type();
    // Handed over even when empty: the builder clears what it last drew rather than leaving it.
    if (config) {
      this.chartBuilder.buildChart(this.chartElm(), config, type);
    }
  }
}
