import { Component, inject } from '@angular/core';
import { PcacData, PcacBarHorizontalChartComponent, PcacBarVerticalChartComponent, PcacLineAreaChartComponent, PcacPieChartComponent } from '@pioneer-code/pioneer-charts';
import { PcService } from '../services/pc.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  imports: [
    PcacBarHorizontalChartComponent,
    PcacBarVerticalChartComponent,
    PcacLineAreaChartComponent,
    PcacPieChartComponent,
    MatCardModule
  ]
})
export class ChartsComponent {
  readonly service = inject(PcService)

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
