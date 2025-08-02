import { Component, OnInit, inject } from '@angular/core';
import { AppService } from '../../../../../app.service';
import { IJumpNav, JumpNavLevel } from '../../../../../layouts/jump-nav/jump-nav.component';
import { MatCardModule } from '@angular/material/card';
import { CodeComponent } from '../../../../../components/prism/code.component';
import { PageHeaderComponent } from '../../../../../layouts/page-header/page-header.component';
import { DocLayoutComponent } from '../../../../../layouts/doc/doc.component';
import { BaseConfigComponent } from '../../../../../components/base-config/base-config.component';
import { StringifyPipe } from '../../../../../stringify.pipe';
import { PcacPieChartComponent } from '@pioneer-code/pioneer-charts';


@Component({
    selector: 'pc-pie-chart',
    templateUrl: './pie-chart.component.html',
    imports: [
        MatCardModule,
        PcacPieChartComponent,
        BaseConfigComponent,
        DocLayoutComponent,
        PageHeaderComponent,
        CodeComponent,
        StringifyPipe,
    ]
})
export class PieChartComponent {
  pcService = inject(AppService);

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
}
