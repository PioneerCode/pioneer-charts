import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { PcacPlotChart } from '@pioneer-code/pioneer-charts';
import { PlotLineAreaBaseComponent } from '../base/base.component';



@Component({
  selector: 'pc-plot-chart',
  templateUrl: './plot-chart.component.html',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacPlotChart,
    StringifyPipe
  ]
})
export class PlotChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-plot-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacPlotChart } from '@pioneer-code/pioneer-charts';`;
}

