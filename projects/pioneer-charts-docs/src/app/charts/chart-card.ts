import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

/** One example on the Charts page: a titled card with a one-line caption above its chart. */
@Component({
  selector: 'pc-chart-card',
  imports: [MatCardModule],
  host: { class: 'block h-full' },
  template: `
    <mat-card class="p-4 h-full">
      <h3 class="pc-chart-card-title">{{ heading() }}</h3>
      <p class="pc-chart-card-caption">{{ caption() }}</p>
      <ng-content />
    </mat-card>
  `,
  styles: `
    .pc-chart-card-title { font-size: 1rem; font-weight: 500; margin: 0 0 0.25rem; }
    .pc-chart-card-caption { font-size: 0.875rem; color: rgba(0, 0, 0, 0.6); margin: 0 0 0.75rem; }
  `,
})
export class ChartCard {
  readonly heading = input.required<string>();
  readonly caption = input.required<string>();
}
