import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

/**
 * The card every example chart on the site is shown in: a title, an optional one-line caption, and
 * the chart. The chart's contract button sits in its top-right corner (see ChartContract).
 *
 * The title is an `h3` by default, for a card inside a page section; `level` 2 for one that sits
 * straight under the page's own title, so the page's headings don't skip a level.
 *
 * The chart's area fills whatever height the card is given beyond its title - so a card with a set
 * height holds a `heightFull` chart (the Full Height page) - and is only as tall as the chart
 * otherwise.
 */
@Component({
  selector: 'pc-chart-card',
  imports: [MatCardModule],
  host: { class: 'block h-full' },
  template: `
    <mat-card class="p-4 h-full">
      @if (level() === 2) {
        <h2 class="pc-chart-card-title">{{ heading() }}</h2>
      } @else {
        <h3 class="pc-chart-card-title">{{ heading() }}</h3>
      }
      @if (caption()) {
        <p class="pc-chart-card-caption">{{ caption() }}</p>
      }
      <div class="pc-chart-card-body">
        <ng-content />
      </div>
    </mat-card>
  `,
  styles: `
    @use '@angular/material' as mat;

    // White rather than Material's default card fill (the theme's surface-container-low, a warm
    // grey) - on the light theme; on the dark one, a step up from the page's surface.
    :host {
      @include mat.card-overrides((elevated-container-color: light-dark(#fff, var(--mat-sys-surface-container))));
    }

    // Clear of the contract button in the card's top-right corner.
    .pc-chart-card-title { font-size: 1rem; font-weight: 500; margin: 0 2.5rem 0.25rem 0; }
    .pc-chart-card-caption { font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); margin: 0; }
    .pc-chart-card-body { flex: 1 1 auto; min-height: 0; margin-top: 0.75rem; }
  `,
})
export class ChartCard {
  readonly heading = input.required<string>();
  readonly caption = input<string>();
  readonly level = input<2 | 3>(3);
}
