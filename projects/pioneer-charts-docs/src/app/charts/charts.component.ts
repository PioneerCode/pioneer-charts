import { Component, computed, inject } from '@angular/core';
import {
  PcacBarHorizontalChartComponent,
  PcacBarVerticalChartComponent,
  PcacPieChart,
  PcacDonutChart,
  PcacAreaChart,
  PcacLineChart
} from '@pioneer-code/pioneer-charts';
import { MatCardModule } from '@angular/material/card';
import { AppService } from '../app.service';
import { LayoutResourceState } from '../layout/resource-state/resource-state';

@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  imports: [
    PcacBarVerticalChartComponent,
    PcacBarHorizontalChartComponent,
    PcacLineChart,
    PcacAreaChart,
    PcacPieChart,
    PcacDonutChart,
    MatCardModule,
    LayoutResourceState
  ]
})
export class ChartsComponent {
  readonly service = inject(AppService);

  /** The pie's data again, drawn as a donut with its total in the center. */
  readonly donutConfig = computed(() => {
    const config = this.service.pieChartConfig.value();
    const total = (config.data ?? []).reduce((sum, d) => sum + Number(d.value ?? 0), 0);
    return { ...config, label: String(total), subLabel: 'total' };
  });
}
