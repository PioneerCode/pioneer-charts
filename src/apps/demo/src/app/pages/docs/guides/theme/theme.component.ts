import { Component, OnInit } from '@angular/core';
import { IJumpNav } from '../../../../components/jump-nav/jump-nav.component';

@Component({
  selector: 'pc-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {
  jumpNav = [
    {
      key: 'Default Theme',
      value: 'default-theme'
    },
    {
      key: 'Sass',
      value: 'sass'
    },
    {
      key: 'Customize',
      value: 'customize',
      jump: [
        {
          key: 'Styles',
          value: 'styles'
        },
        {
          key: 'Color Service',
          value: 'color-service'
        }
      ]
    },
  ] as IJumpNav[];
  importStylesCode = `@import "~@pioneer-code/pioneer-charts/pcac";`;
  importStylesCodeOverride = `// Your variable overrides
$theme-colors: ( "primary": #24282e, "primary-light": #a3a1fb, "success": #5ee2a0, "danger": #ff6565, "warning": #fec163);

// Pioneer Charts and its default variables
@import "~@pioneer-code/pioneer-charts/pcac";`;
  colorServiceExample = `...
this.colors = this.colorService.getColorScale(config.data.length);
...

...
.style('fill', (d: IPcacData, i: number) => {
  return this.colors[i];
})
...`;
  importColorService = `import { Component, OnInit } from '@angular/core';
import { PcacColorService } from 'libs/pcac/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public colorService: PcacColorService) { }
  ...
}`;
  constructor() { }

  ngOnInit() {
  }

}
