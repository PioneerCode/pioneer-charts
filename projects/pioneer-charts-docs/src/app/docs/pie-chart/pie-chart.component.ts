import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PcacPieChartComponent } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { StringifyPipe } from '../../stringify.pipe';


@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  imports: [
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    MatCardModule,
    PcacPieChartComponent,
    StringifyPipe,
  ]
})
export class PieChartComponent {
  pcService = inject(AppService);

  // jumpNav = [
  //   {
  //     key: 'Pie Chart',
  //     value: 'pie-chart',
  //     level: JumpNavLevel.h1
  //   },
  //   {
  //     key: 'Markup',
  //     value: 'markup',
  //     level: JumpNavLevel.h2
  //   },
  //   {
  //     key: 'API',
  //     value: 'api',
  //     level: JumpNavLevel.h2
  //   },
  //   {
  //     key: 'Configuration',
  //     value: 'configuration',
  //     level: JumpNavLevel.h3
  //   },
  //   {
  //     key: 'Events',
  //     value: 'events',
  //     level: JumpNavLevel.h2
  //   },
  //   {
  //     key: 'Contract',
  //     value: 'contract',
  //     level: JumpNavLevel.h2
  //   }
  // ] as IJumpNav[];
  markupCode = `<pcac-pie-chart [config]="config" (sliceClicked)="onClicked($event)"></pcac-pie-chart>`;
  importCode = `import { PcacPieChartModule } from '@pioneer-code/pioneer-charts';`;
}
