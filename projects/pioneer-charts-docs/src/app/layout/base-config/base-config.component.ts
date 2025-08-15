import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout-base-config',
  templateUrl: './base-config.component.html',
  styleUrls: ['./base-config.component.scss']
})
export class LayoutBaseConfig {
  readonly includeTickFormat = input(false);
  readonly includeHideAxisAndGrid = input(false);
}
