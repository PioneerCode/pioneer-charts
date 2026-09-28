import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppService } from '../../../app.service';
import {
  PcacAreaChart, PcacLineChart, PcacPlotChart, PcacPointFanOutConfig, PcacPointRangeConfig, PcacPointRangeShow,
  PcacPointRangeStyle, PcacTooltipDirective
} from '@pioneer-code/pioneer-charts';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';
import { ChartCard } from '../../../layout/chart-card/chart-card';
import { ChartContract } from '../../../layout/chart-contract/chart-contract';
import { ThemeService } from '../../../layout/theme.service';

@Component({
  selector: 'pc-plot-chart',
  templateUrl: './plot-chart.component.html',
  styleUrl: './plot-chart.component.scss',
  imports: [
    ChartCard,
    ChartContract,
    PlotLineAreaBaseComponent,
    PcacPlotChart,
    PcacLineChart,
    PcacAreaChart,
    PcacTooltipDirective,
    NgTemplateOutlet,
    RouterLink,
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

  private readonly theme = inject(ThemeService);

  /**
   * The two color fields, with the theme's own color for each so an unset picker shows what's
   * drawn - the lighter pair the site's dark theme sets (styles.scss) while it's on.
   */
  protected readonly fanOutColors = computed(() => [
    { field: 'spokeColor', theme: this.theme.dark() ? '#6c757d' : '#ced4da' },
    { field: 'anchorColor', theme: this.theme.dark() ? '#adb5bd' : '#6c757d' },
  ] as const);

  /** Same pattern as the Axis Styling page: a fresh config object so the chart rebuilds. */
  protected readonly fanOutConfig = computed(() => ({
    ...this.pcService.plotFanOutConfig.value(),
    pointFanOut: this.fanOutEnabled() ? this.fanOut() : undefined,
  }));

  /**
   * The reference-line demo: the fan-out mock, split at noon and at 50 into four named quadrants.
   * Its x axis zooms, so the vertical line can be seen moving with the data while the corner
   * labels stay put.
   */
  protected readonly referenceConfig = computed(() => ({
    ...this.pcService.plotFanOutConfig.value(),
    referenceLines: [
      { axis: 'x' as const, value: 12, label: 'Noon' },
      { axis: 'y' as const, value: 50, label: '50' },
    ],
    cornerLabels: {
      topLeft: 'Morning, high',
      topRight: 'Afternoon, high',
      bottomLeft: 'Morning, low',
      bottomRight: 'Afternoon, low',
    },
    ariaLabel: 'Readings by hour, split at noon and at 50 into four quadrants',
  }));

  /**
   * The gauge demo: the fan-out mock with a made-up chance of rain on the cloudy and rainy
   * readings. Sunny and unknown readings get no gauge, so they get no ring.
   */
  private static readonly RAIN_CHANCE: Record<string, number[]> = {
    Cloudy: [0.1, 0.2, 0.3, 0.25, 0.35, 0.15],
    Rain: [0.9, 0.7, 0.8, 1, 0.6],
  };
  protected readonly gaugeConfig = computed(() => {
    const mock = this.pcService.plotFanOutConfig.value();
    return {
      ...mock,
      data: mock.data.map(series => ({
        ...series,
        data: series.data.map((point, i) => {
          const chance = PlotChartComponent.RAIN_CHANCE[series.key as string]?.[i];
          return chance === undefined ? point : { ...point, gauge: chance };
        }),
      })),
      pointGauge: { max: 1, name: 'Chance of rain' },
      ariaLabel: 'Readings by hour; a ring around each cloudy or rainy reading shows its chance of rain',
    };
  });

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
