import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout-base-config',
  templateUrl: './base-config.component.html',
})
export class LayoutBaseConfig {
  readonly includeTickFormat = input(false);
  readonly includeHideAxisAndGrid = input(false);
}
