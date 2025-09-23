import { Component, inject, model } from '@angular/core';
import { PcacColorService } from '../core';

export class PcacLegendConfigItem {
  label!: string;
  checked: boolean = true;
}

export class PcacLegendConfig {
  heading: string | null = null;
  items: PcacLegendConfigItem[] = [];
}

@Component({
  selector: 'pcac-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
})
export class PcacLegend {
  config = model.required<PcacLegendConfig>();
  readonly colorService = inject(PcacColorService);
}
