import { Component } from '@angular/core';
import { AppService } from '../../../../../app.service';
import { IJumpNav, JumpNavLevel } from '../../../../../layouts/jump-nav/jump-nav.component';
import { MatCardModule } from '@angular/material/card';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { BaseConfigComponent } from 'projects/pioneer-charts-web/src/app/components/base-config/base-config.component';
import { DocLayoutComponent } from 'projects/pioneer-charts-web/src/app/layouts/doc/doc.component';
import { PageHeaderComponent } from 'projects/pioneer-charts-web/src/app/layouts/page-header/page-header.component';

@Component({
  selector: 'pc-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    PcacLineAreaChartComponent,
    BaseConfigComponent,
    DocLayoutComponent,
    PageHeaderComponent
  ]
})
export class LineAreaChartComponent {
  jumpNav = [
    {
      key: 'Line Area Chart',
      value: 'line-area-chart',
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
  markupCode = `<pcac-line-area-chart [config]="config" (dotClicked)="onClicked($event)"></pcac-line-area-chart>`;
  importCode = `import { PcacLineAreaChartModule } from '@pioneer-code/pioneer-charts';`;
  constructor(public pcService: AppService) { }
}

