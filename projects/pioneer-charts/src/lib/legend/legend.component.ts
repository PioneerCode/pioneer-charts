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

@Component({
  selector: 'pcac-legend',
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.scss',
})
export class PcacLegend {
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
