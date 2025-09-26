import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacLineChart } from '@pioneer-code/pioneer-charts';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { PlotLineAreaBaseComponent } from '../base/base.component';



@Component({
  selector: 'pc-line-chart',
  templateUrl: './line-chart.component.html',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacLineChart,
    StringifyPipe,
  ]
})
export class LineChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-line-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacLineChart } from '@pioneer-code/pioneer-charts';`;
}

