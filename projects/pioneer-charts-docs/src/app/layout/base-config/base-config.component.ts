import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout-base-config',
  templateUrl: './base-config.component.html',
})
export class LayoutBaseConfig {
  readonly includeTickFormat = input(false);
  // The pie chart deliberately doesn't support heightFull (its `height` sizes the radius, not a
  // drawing area), so its page turns this row off.
  readonly includeHeightFull = input(true);
  readonly includeHideAxisAndGrid = input(false);
}
