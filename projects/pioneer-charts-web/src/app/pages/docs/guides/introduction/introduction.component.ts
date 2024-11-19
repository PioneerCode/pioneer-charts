import { Component } from '@angular/core';
import { IJumpNav, JumpNavLevel } from '../../../../layouts/jump-nav/jump-nav.component';
import { DocLayoutComponent } from '../../../../layouts/doc/doc.component';
import { PageHeaderComponent } from '../../../../layouts/page-header/page-header.component';
import { RouterLink } from '@angular/router';
import { CodeComponent } from 'projects/pioneer-charts-web/src/app/components/prism/code.component';

@Component({
    selector: 'pc-introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.scss'],
    imports: [
        RouterLink,
        DocLayoutComponent,
        PageHeaderComponent,
        CodeComponent
    ]
})
export class IntroductionComponent {
  jumpNav = [
    {
      key: 'Getting Started',
      value: 'getting-started',
      level: JumpNavLevel.h1
    },
    {
      key: 'Introduction',
      value: 'introduction',
      level: JumpNavLevel.h2
    },
    {
      key: 'Quick Start',
      value: 'quick-start',
      level: JumpNavLevel.h2
    },
    {
      key: 'Install',
      value: 'step-1-install-pioneer-charts',
      level: JumpNavLevel.h3
    },
    {
      key: 'Import Modules',
      value: 'step-2-import-modules',
      level: JumpNavLevel.h3
    },
    {
      key: 'Import Styles',
      value: 'step-3-import-styles',
      level: JumpNavLevel.h3
    }
  ] as IJumpNav[];
  npmInstallCode = `npm install --save @pioneer-code/pioneer-charts`;
  yarnInstallCode = `yarn add @pioneer-code/pioneer-charts`;
  appModuleCode = `import {PcacTableModule} from '@pioneer-code/pioneer-charts';

@NgModule({
  ...
  imports: [PcacTableModule],
  ...
})
export class YourAppModule { }`;

  specialModuleCode = `import {PcacTableModule, PcacLineAreaChartModule} from '@pioneer-code/pioneer-charts';

@NgModule({
  imports: [PcacTableModule, PcacLineAreaChartModule],
  exports: [PcacTableModule, PcacLineAreaChartModule],
})
export class PioneerChartsImportModule { }`;

  appSpecialModuleCode = `import {PioneerChartsImportModule} from './pioneer-charts-import.module;

@NgModule({
  ...
  imports: [PioneerChartsImportModule],
  ...
})
export class YourAppModule { }`;

  importStylesCode = `@import "~@pioneer-code/pioneer-charts/pcac.css";`;
}
