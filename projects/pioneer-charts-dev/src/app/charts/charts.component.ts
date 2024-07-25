import { Component, inject } from '@angular/core';
import { IPcacData, PcacBarChartHorizontalComponent, PcacBarVerticalChartComponent, PcacLineAreaChartComponent, PcacPieChartComponent } from '@pioneer-code/pioneer-charts';
import { PcService } from '../services/pc.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  standalone: true,
  imports: [
    PcacBarChartHorizontalComponent,
    PcacBarVerticalChartComponent,
    PcacLineAreaChartComponent,
    PcacPieChartComponent,
    MatCardModule
  ]
})
export class ChartsComponent {
  readonly service = inject(PcService)

  onClicked(data: IPcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
