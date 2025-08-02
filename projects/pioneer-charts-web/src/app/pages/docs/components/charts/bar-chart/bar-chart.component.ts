import { Component, inject } from '@angular/core';
import { AppService } from '../../../../../app.service';
import { IJumpNav, JumpNavLevel } from '../../../../../layouts/jump-nav/jump-nav.component';
import { PcacBarHorizontalChartComponent, PcacBarVerticalChartComponent } from '@pioneer-code/pioneer-charts';
import { MatCardModule } from '@angular/material/card';
import { BaseConfigComponent } from '../../../../../components/base-config/base-config.component';
import { CodeComponent } from '../../../../../components/prism/code.component';
import { DocLayoutComponent } from '../../../../../layouts/doc/doc.component';
import { PageHeaderComponent } from '../../../../../layouts/page-header/page-header.component';
import { StringifyPipe } from '../../../../../stringify.pipe';


@Component({
    selector: 'pc-bar-chart',
    templateUrl: './bar-chart.component.html',
    imports: [
        MatCardModule,
        PageHeaderComponent,
        DocLayoutComponent,
        BaseConfigComponent,
        CodeComponent,
        StringifyPipe,
        PcacBarHorizontalChartComponent,
        PcacBarVerticalChartComponent
    ]
})
export class BarChartComponent {
  verticalCode = `<pcac-bar-vertical-chart [config]="barVerticalChartConfig" (barClicked)="onClicked($event)"></pcac-bar-vertical-chart>`;
  horizontalCode = `<pcac-bar-horizontal-chart [config]="barHorizontalChartConfig" (barClicked)="onClicked($event)"></pcac-bar-horizontal-chart>`;
  importCode = `import { PcacBarVerticalChartModule, PcacBarHorizontalChartModule } from '@pioneer-code/pioneer-charts';`;
  jumpNav = [
    {
      key: 'Bar Chart',
      value: 'bar-chart',
      level: JumpNavLevel.h1
    },
    {
      key: 'Markup',
      value: 'markup',
      level: JumpNavLevel.h2
    },
    {
      key: 'Horizontal',
      value: 'horizontal',
      level: JumpNavLevel.h3
    },
    {
      key: 'Vertical',
      value: 'vertical',
      level: JumpNavLevel.h3
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

  readonly service = inject(AppService);
}
