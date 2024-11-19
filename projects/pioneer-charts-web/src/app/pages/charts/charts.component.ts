import { Component, inject } from '@angular/core';
import { PcacData, PcacBarHorizontalChartComponent, PcacBarVerticalChartComponent, PcacLineAreaChartComponent, PcacPieChartComponent } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { PublicLayoutComponent } from '../../layouts/public/public.component';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'pc-charts',
    templateUrl: './charts.component.html',
    imports: [
        PublicLayoutComponent,
        PcacBarVerticalChartComponent,
        PcacBarHorizontalChartComponent,
        PcacLineAreaChartComponent,
        PcacPieChartComponent,
        MatCardModule
    ]
})
export class ChartsComponent {
  readonly service = inject(AppService);

  onEditClicked(row: PcacData): void {
    alert("Edit Row");
  }

  onDeleteClicked(row: PcacData): void {
    alert("Delete Row");
  }

  onHistoryClicked(row: PcacData): void {
    alert("Show History");
  }
}
