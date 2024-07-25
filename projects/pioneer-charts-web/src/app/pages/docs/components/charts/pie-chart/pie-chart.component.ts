import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../../../app.service';
import { IJumpNav, JumpNavLevel } from '../../../../../components/jump-nav/jump-nav.component';

@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent {
  jumpNav = [
    {
      key: 'Pie Chart',
      value: 'pie-chart',
      level: JumpNavLevel.h1
    },
    {
      key: 'Markup',
      value: 'markup',
      level: JumpNavLevel.h2
    },
    {
      key: 'API',
      value: 'api',
      level: JumpNavLevel.h2
    },
    {
      key: 'Configuration',
      value: 'configuration',
      level: JumpNavLevel.h3
    },
    {
      key: 'Events',
      value: 'events',
      level: JumpNavLevel.h2
    },
    {
      key: 'Contract',
      value: 'contract',
      level: JumpNavLevel.h2
    }
  ] as IJumpNav[];
  markupCode = `<pcac-pie-chart [config]="config" (sliceClicked)="onClicked($event)"></pcac-pie-chart>`;
  importCode = `import { PcacPieChartModule } from '@pioneer-code/pioneer-charts';`;

  constructor(public pcService: AppService) { }
}
