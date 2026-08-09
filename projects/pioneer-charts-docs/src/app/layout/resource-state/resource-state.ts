import { Component, input, Resource } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Overlays the loading/error state of an `httpResource` on top of its projected content.
 *
 * The projected chart is always rendered (never gated behind `@if`), because pioneer-charts'
 * chart components rely on mounting early with their default config and re-rendering once real
 * data arrives via a second `ngOnChanges` — gating creation on `resource().isLoading()` would
 * mount them for the first time already holding real data, racing their own view-child init.
 */
@Component({
  selector: 'app-layout-resource-state',
  imports: [MatProgressSpinnerModule],
  templateUrl: './resource-state.html',
  styleUrl: './resource-state.scss',
})
export class LayoutResourceState {
  readonly resource = input.required<Resource<unknown>>();
}
