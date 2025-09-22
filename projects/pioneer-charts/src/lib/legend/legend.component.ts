import { Component, inject, model } from '@angular/core';
import { PcacColorService } from '@pioneer-code/pioneer-charts';

export class PcacLegendConfig {
  heading: string | null = null;
  items: { label: string }[] = [];
}

@Component({
  selector: 'pcac-legend',
  imports: [
  ],
  templateUrl: './legend.component.html'
})
export class PcacLegend {
  config = model.required<PcacLegendConfig>();
  readonly colorService = inject(PcacColorService);
}
