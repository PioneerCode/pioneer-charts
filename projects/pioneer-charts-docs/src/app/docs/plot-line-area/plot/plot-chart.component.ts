import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import {
  PcacAreaChart, PcacLineChart, PcacPlotChart, PcacPointFanOutConfig, PcacPointRangeConfig, PcacPointRangeShow,
  PcacPointRangeStyle, PcacTooltipDirective
} from '@pioneer-code/pioneer-charts';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';

@Component({
  selector: 'pc-plot-chart',
  templateUrl: './plot-chart.component.html',
  styleUrl: './plot-chart.component.scss',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacPlotChart,
    PcacLineChart,
    PcacAreaChart,
    PcacTooltipDirective,
    NgTemplateOutlet,
    RouterLink,
    StringifyPipe,
    LayoutResourceState
  ]
})
export class PlotChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-plot-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacPlotChart, PcacTooltipDirective } from '@pioneer-code/pioneer-charts';`;

  /**
   * The fan-out demo's editable `pointFanOut`. Starts as `{}` - every default - to match the
   * mock; `radius` unset means each group sizes its own ring from `gap`. With `fanOutEnabled`
   * off the config gets no `pointFanOut` at all, which is how a consumer turns the fan-out off.
   */
  protected readonly fanOutEnabled = signal(true);
  protected readonly fanOut = signal<Partial<PcacPointFanOutConfig>>({});

  /** The two color fields, with the theme's own color for each so an unset picker shows what's drawn. */
  protected readonly fanOutColors = [
    { field: 'spokeColor', theme: '#ced4da' },
    { field: 'anchorColor', theme: '#6c757d' },
  ] as const;

  /** Same pattern as the Axis Styling page: a fresh config object so the chart rebuilds. */
  protected readonly fanOutConfig = computed(() => ({
    ...this.pcService.plotFanOutConfig.value(),
    pointFanOut: this.fanOutEnabled() ? this.fanOut() : undefined,
  }));

  /**
   * The point-range demo: one data set, drawn as whichever chart type is picked, with an editable
   * `pointRange`. Starts as `{}` - every default - to match the mock.
   */
  protected readonly rangeChartTypes = ['plot', 'line', 'area'] as const;
  protected readonly rangeChartType = signal<'plot' | 'line' | 'area'>('plot');
  protected readonly rangeStyles = Object.values(PcacPointRangeStyle);
  protected readonly rangeShows = Object.values(PcacPointRangeShow);
  protected readonly pointRange = signal<Partial<PcacPointRangeConfig>>({});
  protected readonly rangeConfig = computed(() => ({
    ...this.pcService.plotRangeConfig.value(),
    pointRange: this.pointRange(),
  }));

  /** Sets one `pointRange` field; `undefined` puts it back to its default. */
  protected setPointRange<K extends keyof PcacPointRangeConfig>(field: K, value: PcacPointRangeConfig[K] | undefined): void {
    this.pointRange.update(r => ({ ...r, [field]: value }));
  }

  protected onFanOutEnabled(event: Event): void {
    this.fanOutEnabled.set((event.target as HTMLInputElement).checked);
  }

  /** Sets one field; `undefined` puts it back to its default (auto `radius`, the theme's color). */
  protected setFanOut<K extends keyof PcacPointFanOutConfig>(field: K, value: PcacPointFanOutConfig[K] | undefined): void {
    this.fanOut.update(f => ({ ...f, [field]: value }));
  }
}
