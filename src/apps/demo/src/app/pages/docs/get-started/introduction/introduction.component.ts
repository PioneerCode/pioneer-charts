import { Component } from '@angular/core';

@Component({
  selector: 'pc-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent {
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
