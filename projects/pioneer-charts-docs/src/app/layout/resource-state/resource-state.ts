import { Component, input, Resource } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Overlays the loading/error state of an `httpResource` on top of its projected content.
 *
 * The projected chart is always rendered (never gated behind `@if`): it mounts with the
 * resource's default config and its build effect re-runs once real data arrives. (The charts
 * can also cope with mounting already holding data - see PcacChartResizeService - but there's no
 * reason to exercise that path here.)
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
