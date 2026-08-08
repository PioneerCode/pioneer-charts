import { Component, signal } from '@angular/core';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  imports: [
    LayoutCode,
    LayoutPageDocs
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
      key: 'Color Service',
      value: 'color-service',
    }
  ]);
  importStylesCode = `@import "node_modules/@pioneer-code/pioneer-charts/scss/pcac";`;
  importStylesCodeOverride = `// Your variable overrides
$theme-colors: ( "primary": #24282e, "primary-light": #a3a1fb, "success": #5ee2a0, "danger": #ff6565, "warning": #fec163);

// Pioneer Charts and its default variables
@import "node_modules/@pioneer-code/pioneer-charts/scss/pcac";`;
  colorServiceExample = `...
this.colors = this.colorService.getColorScale(config.data.length);
...

...
.style('fill', (d: PcacData, i: number) => {
  return this.colors[i];
})
...`;
  importColorService = `import { Component, OnInit } from '@angular/core';
import { PcacColorService } from '@pioneer-code/pioneer-charts';;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public colorService: PcacColorService) { }
  this.colorService.setScale([...]);
}`;
}
