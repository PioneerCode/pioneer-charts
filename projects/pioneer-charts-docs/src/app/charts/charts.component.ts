import { Component, inject } from '@angular/core';
import {
  PcacBarHorizontalChartComponent,
  PcacBarVerticalChartComponent,
  PcacPieChartComponent,
  PcacAreaChart,
  PcacLineChart
} from '@pioneer-code/pioneer-charts';
import { MatCardModule } from '@angular/material/card';
import { AppService } from '../app.service';

@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  imports: [
    PcacBarVerticalChartComponent,
    PcacBarHorizontalChartComponent,
    PcacLineChart,
    PcacAreaChart,
    PcacPieChartComponent,
    MatCardModule
  ]
})
export class ChartsComponent {
  readonly service = inject(AppService);
}
