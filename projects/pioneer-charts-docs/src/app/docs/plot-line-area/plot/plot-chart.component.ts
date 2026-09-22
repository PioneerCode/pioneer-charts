import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { PcacPlotChart, PcacPointFanOutConfig, PcacTooltipDirective } from '@pioneer-code/pioneer-charts';
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
    PcacTooltipDirective,
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

  protected onFanOutEnabled(event: Event): void {
    this.fanOutEnabled.set((event.target as HTMLInputElement).checked);
  }

  /** Sets one field; `undefined` puts it back to its default (auto `radius`, the theme's color). */
  protected setFanOut<K extends keyof PcacPointFanOutConfig>(field: K, value: PcacPointFanOutConfig[K] | undefined): void {
    this.fanOut.update(f => ({ ...f, [field]: value }));
  }
}
