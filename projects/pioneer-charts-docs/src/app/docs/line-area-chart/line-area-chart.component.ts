import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { StringifyPipe } from '../../stringify.pipe';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';



@Component({
  selector: 'pc-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  imports: [
    MatCardModule,
    PcacLineAreaChartComponent,
    StringifyPipe,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
  ]
})
export class LineAreaChartComponent {
  pcService = inject(AppService);

  // jumpNav = [
  //   {
  //     key: 'Line Area Chart',
  //     value: 'line-area-chart',
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
  markupCode = `<pcac-line-area-chart [config]="config" (dotClicked)="onClicked($event)"></pcac-line-area-chart>`;
  importCode = `import { PcacLineAreaChartModule } from '@pioneer-code/pioneer-charts';`;
}

