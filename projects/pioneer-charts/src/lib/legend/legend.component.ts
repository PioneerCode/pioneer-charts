import { Component, computed, inject, model, output } from '@angular/core';
import { PcacColorService } from '../core';

export class PcacLegendConfigItem {
  label!: string;
  checked: boolean = true;
  colorOverride: string | null = null;
}

export class PcacLegendConfig {
  heading: string | null = null;
  items: PcacLegendConfigItem[] = [];
}

let nextLegendId = 0;

@Component({
  selector: 'pcac-legend',
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.scss',
  // One named group of switches, so a screen reader announces the heading ("Series") on entering
  // the legend, and each switch as part of it, rather than a heading and some unrelated switches.
  host: {
    role: 'group',
    '[attr.aria-labelledby]': 'config().heading ? headingId : null',
  },
})
export class PcacLegend {
  readonly headingId = `pcac-legend-heading-${nextLegendId++}`;
  readonly colorService = inject(PcacColorService);
  config = model.required<PcacLegendConfig>();
  itemClicked = output<PcacLegendConfigItem[]>();

  colorScale = computed(() => 
    this.colorService.getColorScale(this.config().items.length)
  );

  onItemClicked(index: number) {
    const items = this.config().items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    this.config.set({ ...this.config(), items });
    this.itemClicked.emit(items);
  }
}
