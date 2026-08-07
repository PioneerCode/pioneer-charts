import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-layout-base-config',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './base-config.component.html',
})
export class LayoutBaseConfig {
  readonly includeTickFormat = input(false);
  readonly includeHideAxisAndGrid = input(false);
}
