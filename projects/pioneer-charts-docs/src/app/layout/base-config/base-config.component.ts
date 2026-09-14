import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout-base-config',
  templateUrl: './base-config.component.html',
  imports: [RouterLink],
})
export class LayoutBaseConfig {
  readonly includeTickFormat = input(false);
  // The pie chart deliberately doesn't support heightFull (its `height` sizes the radius, not a
  // drawing area), so its page turns this row off.
  readonly includeHeightFull = input(true);
  // Only the charts that have axes (everything but pie) show the xAxis / yAxis row.
  readonly includeAxes = input(false);
}
