import { Component, inject } from '@angular/core';
import { AppService } from '../../../../../app.service';
import { IJumpNav, JumpNavLevel } from '../../../../../layouts/jump-nav/jump-nav.component';
import { MatCardModule } from '@angular/material/card';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { BaseConfigComponent } from '../../../../../components/base-config/base-config.component';
import { CodeComponent } from '../../../../../components/prism/code.component';
import { DocLayoutComponent } from '../../../../../layouts/doc/doc.component';
import { PageHeaderComponent } from '../../../../../layouts/page-header/page-header.component';
import { StringifyPipe } from '../../../../../stringify.pipe';


@Component({
    selector: 'pc-line-area-chart',
    templateUrl: './line-area-chart.component.html',
    imports: [
        MatCardModule,
        PcacLineAreaChartComponent,
        BaseConfigComponent,
        DocLayoutComponent,
        PageHeaderComponent,
        CodeComponent,
        StringifyPipe,
    ]
})
export class LineAreaChartComponent {
  pcService = inject(AppService);

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
}

