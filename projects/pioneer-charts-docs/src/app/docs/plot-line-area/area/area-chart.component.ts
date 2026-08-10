import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacAreaChart } from '@pioneer-code/pioneer-charts';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';

@Component({
  selector: 'pc-area-chart',
  templateUrl: './area-chart.component.html',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacAreaChart,
    StringifyPipe,
    LayoutResourceState
  ]
})
export class AreaChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-area-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacAreaChart } from '@pioneer-code/pioneer-charts';`;
}
