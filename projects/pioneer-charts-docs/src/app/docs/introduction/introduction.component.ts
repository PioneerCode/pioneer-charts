import { Component, signal } from '@angular/core';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutCode } from '../../layout/code/code';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss'],
  imports: [
    LayoutCode,
    LayoutPageDocs,
  ]
})
export class IntroductionComponent {
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Getting Started',
      value: 'getting-started',
    },
    {
      key: 'Introduction',
      value: 'introduction',
    },
    {
      key: 'Quick Start',
      value: 'quick-start',
    },
    {
      key: 'Install',
      value: 'step-1-install-pioneer-charts',
    },
    {
      key: 'Import Modules',
      value: 'step-2-import-modules',
    },
    {
      key: 'Import Styles',
      value: 'step-3-import-styles',
    }
  ])

  npmInstallCode = `npm install --save @pioneer-code/pioneer-charts`;
  appModuleCode = `import {PcacLineChart} from '@pioneer-code/pioneer-charts';

@NgModule({
  ...
  imports: [PcacLineChart],
  ...
})
export class YourAppModule { }`;

  importStylesCode = `@import "~@pioneer-code/pioneer-charts/pcac.css";`;
}
