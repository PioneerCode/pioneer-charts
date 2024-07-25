import { Component, inject } from '@angular/core';
import { IPcacData, PcacBarChartHorizontalComponent, PcacBarVerticalChartComponent } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { PublicLayoutComponent } from '../../layouts/public/public.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  standalone: true,
  imports: [
    PublicLayoutComponent,
    PcacBarVerticalChartComponent,
    PcacBarChartHorizontalComponent,
    MatCardModule
  ]
})
export class ChartsComponent {
  readonly service = inject(AppService);

  onEditClicked(row: IPcacData): void {
    alert("Edit Row");
  }

  onDeleteClicked(row: IPcacData): void {
    alert("Delete Row");
  }

  onHistoryClicked(row: IPcacData): void {
    alert("Show History");
  }
}
