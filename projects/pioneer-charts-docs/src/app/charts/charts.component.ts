import { Component, inject } from '@angular/core';
import { 
  PcacData, 
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

  onEditClicked(_row: PcacData): void {
    alert("Edit Row");
  }

  onDeleteClicked(_row: PcacData): void {
    alert("Delete Row");
  }

  onHistoryClicked(_row: PcacData): void {
    alert("Show History");
  }
}
