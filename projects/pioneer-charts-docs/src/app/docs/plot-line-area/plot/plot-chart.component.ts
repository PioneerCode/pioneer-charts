import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { StringifyPipe } from '../../../stringify.pipe';
import { AppService } from '../../../app.service';
import { PcacPlotChart, PcacTooltipDirective } from '@pioneer-code/pioneer-charts';
import { PlotLineAreaBaseComponent } from '../base/base.component';
import { LayoutResourceState } from '../../../layout/resource-state/resource-state';

@Component({
  selector: 'pc-plot-chart',
  templateUrl: './plot-chart.component.html',
  styleUrl: './plot-chart.component.scss',
  imports: [
    PlotLineAreaBaseComponent,
    MatCardModule,
    PcacPlotChart,
    PcacTooltipDirective,
    RouterLink,
    StringifyPipe,
    LayoutResourceState
  ]
})
export class PlotChartComponent {
  pcService = inject(AppService);
  markupCode = `<pcac-plot-chart [config]="config" (dotClicked)="onClicked($event)"/>`;
  importCode = `import { PcacPlotChart, PcacTooltipDirective } from '@pioneer-code/pioneer-charts';`;
}
