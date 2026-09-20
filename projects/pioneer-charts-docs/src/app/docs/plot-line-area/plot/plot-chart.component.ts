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
   * mock; `radius` unset means each group sizes its own ring from `gap`. `enabled` off drops
   * `pointFanOut` from the config altogether, which is how a consumer turns the fan-out off.
   */
  protected readonly fanOutEnabled = signal(true);
  protected readonly fanOut = signal<Partial<PcacPointFanOutConfig>>({});

  /** Same pattern as the Axis Styling page: a fresh config object so the chart rebuilds. */
  protected readonly fanOutConfig = computed(() => {
    const config = this.pcService.plotFanOutConfig.value();
    if (!this.fanOutEnabled()) {
      const { pointFanOut: _, ...rest } = config;
      return rest;
    }
    return { ...config, pointFanOut: this.fanOut() };
  });

  protected onFanOutEnabled(event: Event): void {
    this.fanOutEnabled.set((event.target as HTMLInputElement).checked);
  }

  protected onFanOutNumber(field: 'radius' | 'gap', event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.fanOut.update(f => ({ ...f, [field]: value }));
  }

  /** Back to `radius` unset, so rings size themselves from `gap` again. */
  protected onFanOutAutoRadius(): void {
    this.fanOut.update(({ radius: _, ...rest }) => rest);
  }

  protected onFanOutToggle(field: 'showAnchor', event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.fanOut.update(f => ({ ...f, [field]: value }));
  }

  protected onFanOutColor(field: 'spokeColor' | 'anchorColor', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fanOut.update(f => ({ ...f, [field]: value }));
  }

  protected onFanOutClearColor(field: 'spokeColor' | 'anchorColor'): void {
    this.fanOut.update(f => ({ ...f, [field]: undefined }));
  }
}
