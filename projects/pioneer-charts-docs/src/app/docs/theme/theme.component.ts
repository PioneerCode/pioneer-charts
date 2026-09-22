import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-theme',
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.scss',
  imports: [
    LayoutCode,
    LayoutPageDocs,
    RouterLink
  ]
})
export class ThemeComponent {
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Theme',
      value: 'theme',
    },
    {
      key: 'Default Theme',
      value: 'default-theme',
    },
    {
      key: 'Sass',
      value: 'sass',
    },
    {
      key: 'Customize',
      value: 'customize',
    },
    {
      key: 'Styles',
      value: 'styles',
    },
    {
      key: 'Chart Colors',
      value: 'chart-colors',
    },
    {
      key: 'Color Service',
      value: 'color-service',
    }
  ]);
  customPropertiesCode = `.dark-panel {
  --pcac-axis-label-color: #dee2e6;
  --pcac-axis-sub-label-color: #adb5bd;
  --pcac-axis-tick-label-color: #dee2e6;
  --pcac-axis-tick-color: #adb5bd;
  --pcac-axis-line-color: #adb5bd;
  --pcac-grid-color: #495057;
  --pcac-fan-out-spoke-color: #6c757d;
  --pcac-fan-out-anchor-color: #adb5bd;
}`;
  importStylesCode = `@use "@pioneer-code/pioneer-charts/scss/pioneer-charts";`;
  importStylesCodeOverride = `@use "@pioneer-code/pioneer-charts/scss/pioneer-charts" with (
  $gray-800: #1a1a2e, // tooltip background
  $white: #f4f4f8,    // tooltip text
);`;
  colorServiceExample = `...
this.colors = this.colorService.getColorScale(config.data.length);
...

...
.style('fill', (d: PcacData, i: number) => {
  return this.colors[i];
})
...`;
  importColorService = `import { Component, inject } from '@angular/core';
import { PcacColorService } from '@pioneer-code/pioneer-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  colorService = inject(PcacColorService);

  constructor() {
    this.colorService.setScale([...]);
  }
}`;
}
